import { Router } from 'express';
import fetch from 'node-fetch';
import { format } from 'date-fns';

const router = Router();

// OpenLigaDB helper
const transformOpenLigaMatch = (match: any, statusOverride?: string) => {
  // Find the most relevant result (final result if finished, otherwise the latest intermediate one)
  const results = match.matchResults || [];
  const finalResult = results.find((r: any) => r.resultName === 'Endergebnis' || r.resultName === 'Zwischenergebnis');
  
  // Status logic
  const matchDateTime = new Date(match.matchDateTime);
  const now = new Date();
  const isFinished = match.matchIsFinished;
  const isOngoing = !isFinished && matchDateTime <= now;

  const status: 'LIVE' | 'FINISHED' | 'UPCOMING' = statusOverride as any || 
    (isFinished ? 'FINISHED' : (isOngoing ? 'LIVE' : 'UPCOMING'));

  // OpenLigaDB sometimes doesn't have a final result object for live games, so we use the goals array
  const lastGoal = match.goals && match.goals.length > 0 ? match.goals[match.goals.length - 1] : null;
  
  const hScore = finalResult ? finalResult.pointsTeam1 : (lastGoal ? lastGoal.scoreTeam1 : 0);
  const aScore = finalResult ? finalResult.pointsTeam2 : (lastGoal ? lastGoal.scoreTeam2 : 0);

  return {
    id: match.matchID.toString(),
    homeTeam: match.team1.shortName || match.team1.teamName,
    awayTeam: match.team2.shortName || match.team2.teamName,
    homeScore: hScore,
    awayScore: aScore,
    time: isFinished ? 'FT' : (status === 'LIVE' ? 'Live' : (match.matchDateTime?.split('T')[1]?.substring(0, 5) || 'TBD')),
    date: match.matchDateTime?.split('T')[0],
    status,
    leagueName: match.leagueName || (match.leagueId === 'epl' ? 'Premier League' : 'European League'),
    homeIcon: match.team1.teamIconUrl,
    awayIcon: match.team2.teamIconUrl,
    details: `${match.leagueName || 'League'} | Round: ${match.group?.groupName || 'Season'}`
  };
};

// 1. Live Scores
router.get('/live-scores', async (req, res) => {
  try {
    // Premier League (epl), Bundesliga (bl1), La Liga (spa1), Serie A (ita1)
    const leagues = ['epl', 'bl1', 'spa1', 'ita1'];
    let allMatches: any[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    for (const league of leagues) {
      try {
        const response = await fetch(`https://api.openligadb.de/getmatchdata/${league}/2025`);
        if (!response.ok) continue;
        const data = await response.json() as any[];
        
        // Find matches happening today
        const todayMatches = data.filter(m => m.matchDateTime.includes(today));
        allMatches = [...allMatches, ...todayMatches.map(m => transformOpenLigaMatch(m, 'LIVE'))];
      } catch (e) {
        console.error(`Error fetching live data for ${league}:`, e);
      }
    }

    // Fallback: If no matches today, show last few Premier League matches as "Live" for demo
    if (allMatches.length === 0) {
      const response = await fetch(`https://api.openligadb.de/getmatchdata/epl/2025`);
      const data = await response.json() as any[];
      allMatches = data
        .filter(m => m.matchIsFinished)
        .slice(-5)
        .reverse()
        .map(m => transformOpenLigaMatch(m, 'LIVE'));
    }

    res.json(allMatches);
  } catch (error) {
    console.error("Live scores error:", error);
    res.json([]);
  }
});

// 2. Recent Results
router.get('/recent-results', async (req, res) => {
  try {
    const response = await fetch(`https://api.openligadb.de/getmatchdata/epl/2025`);
    const data = await response.json() as any[];
    
    // Get last 15 finished matches
    const recent = data.filter(m => m.matchIsFinished).slice(-15).reverse().map(m => transformOpenLigaMatch(m));
    res.json(recent);
  } catch (error) {
    console.error("Recent results error:", error);
    res.json([]);
  }
});

// 3. Upcoming Matches
router.get('/upcoming', async (req, res) => {
  try {
    const response = await fetch(`https://api.openligadb.de/getmatchdata/epl/2025`);
    const data = await response.json() as any[];
    
    // Get next 15 upcoming matches
    const upcoming = data.filter(m => !m.matchIsFinished && new Date(m.matchDateTime) > new Date()).slice(0, 15).map(m => transformOpenLigaMatch(m));
    res.json(upcoming);
  } catch (error) {
    console.error("Upcoming matches error:", error);
    res.json([]);
  }
});

// 4. Latest News (Keeping the user's RapidAPI config)
router.get('/latest-news', async (req, res) => {
  const query = req.query.query || 'football news'; 
  const url = `https://facebook-scraper3.p.rapidapi.com/search/pages?query=${query}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '73c070e410msh4125b13b96383aap11e0a1jsn259ceb384b99',
      'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json() as any;
    
    if (result && result.results) {
      const news = result.results.slice(0, 6).map((item: any, index: number) => ({
        id: index,
        title: item.title || item.name || 'Football News Update',
        summary: item.description || item.about || 'Latest updates from the world of football.',
        content: `Source: ${item.url || 'Internal'}. Followers: ${item.followers || 'N/A'}. ${item.description || ''}`
      }));
      return res.json({ mockNews: news });
    }
    res.json({ mockNews: [] });
  } catch (error: any) {
    console.error("News error:", error);
    res.json({ mockNews: [] });
  }
});

// 5. Single Match Details
router.get('/match/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.openligadb.de/getmatchdata/${id}`);
    if (!response.ok) return res.status(404).json({ error: 'Match not found' });
    const data = await response.json();
    res.json(transformOpenLigaMatch(data));
  } catch (error) {
    console.error("Match detail error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
