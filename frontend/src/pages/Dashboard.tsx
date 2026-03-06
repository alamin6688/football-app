import { useState, useEffect } from 'react';
import type { Match, NewsItem } from '../types';
import { Modal } from '../components/Modal';
import { Activity, Calendar, Trophy, Newspaper, ChevronRight, AlertCircle, Loader } from 'lucide-react';

export const Dashboard = () => {
  const [liveScores, setLiveScores] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchData = async () => {
    try {
      // Ports synced to user request: 5001
      const BASE_URL = 'http://localhost:5001/api/matches';
      const [liveRes, recentRes, upcomingRes, newsRes] = await Promise.all([
        fetch(`${BASE_URL}/live`),
        fetch(`${BASE_URL}/recent/4331`), 
        fetch(`${BASE_URL}/upcoming/4331`),
        fetch(`${BASE_URL}/latest-news`)
      ]);

      if (!liveRes.ok || !recentRes.ok || !upcomingRes.ok) {
        throw new Error('Backend server error or data not found');
      }

      const liveJson = await liveRes.json();
      const recentJson = await recentRes.json();
      const upcomingJson = await upcomingRes.json();
      const newsJson = await newsRes.json();

      setLiveScores(liveJson.data || []);
      setRecentResults(recentJson.data || []);
      setUpcomingMatches(upcomingJson.data || []);
      setNews(newsJson.mockNews || []);
      setError(null);
    } catch (err: any) {
      console.error('Frontend Fetch Error:', err);
      setError('Could not connect to the Backend server. Please ensure port 5001 is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && liveScores.length === 0) {
    return (
      <div className="flex-center h-screen">
        <Loader className="animate-spin text-accent" size={40} />
        <p className="ml-3 font-semibold">Loading Live Stats...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="hero-section">
        <h1 className="hero-title">Football Pulse</h1>
        <p className="hero-subtitle">Real-time scores, news, and match insights.</p>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchData()} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Live Scores */}
        <section className="section-card">
          <div className="section-header">
            <Activity className="text-accent" size={20} />
            <h2>Live Scores</h2>
          </div>
          <div className="match-list">
            {liveScores.length > 0 ? liveScores.map((match) => (
              <div className="match-card" key={`live-${match.idEvent}`}>
                <div className="team">
                  <span>{match.strHomeTeam}</span>
                </div>
                <div className="score-box">
                  <div className="score">{match.intHomeScore || '0'} - {match.intAwayScore || '0'}</div>
                  <div className="match-time live-badge">{match.strStatus}</div>
                </div>
                <div className="team right">
                  <span>{match.strAwayTeam}</span>
                </div>
              </div>
            )) : <p className="empty-msg">No matches ongoing at the moment.</p>}
          </div>
        </section>

        {/* Recent Results */}
        <section className="section-card">
          <div className="section-header">
            <Trophy className="text-secondary" size={20} />
            <h2>Recent Results</h2>
          </div>
          <div className="match-list">
            {recentResults.length > 0 ? recentResults.map((match) => (
              <div 
                className="match-card clickable" 
                key={`recent-${match.idEvent}`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="team">
                  <span>{match.strHomeTeam}</span>
                </div>
                <div className="score-box">
                  <div className="score">{match.intHomeScore} - {match.intAwayScore}</div>
                  <div className="match-time date-badge">{match.strTimestamp?.split(' ')[0]}</div>
                </div>
                <div className="team right">
                  <span>{match.strAwayTeam}</span>
                </div>
              </div>
            )) : <p className="empty-msg">No recent results found for this league.</p>}
          </div>
        </section>

        {/* Upcoming */}
        <section className="section-card">
          <div className="section-header">
            <Calendar className="text-accent" size={20} />
            <h2>Upcoming</h2>
          </div>
          <div className="match-list">
            {upcomingMatches.length > 0 ? upcomingMatches.map((match) => (
              <div className="match-card" key={`upcoming-${match.idEvent}`}>
                <div className="team">
                  <span>{match.strHomeTeam}</span>
                </div>
                <div className="score-box">
                  <div className="vs-label">VS</div>
                  <div className="match-time date-badge">{match.strTimestamp?.split(' ')[0]}</div>
                </div>
                <div className="team right">
                  <span>{match.strAwayTeam}</span>
                </div>
              </div>
            )) : <p className="empty-msg">No upcoming matches scheduled.</p>}
          </div>
        </section>

        {/* News Feed */}
        <section className="section-card full-width">
          <div className="section-header">
            <Newspaper className="text-secondary" size={20} />
            <h2>Latest News</h2>
          </div>
          <div className="news-grid">
            {news.map((item) => (
              <div className="news-card" key={item.id} onClick={() => setSelectedNews(item)}>
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="read-more">Read Full Story <ChevronRight size={16} /></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modals */}
      {selectedMatch && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedMatch(null)} 
          title="Match Review"
        >
          <div className="match-modal-view">
            <div className="modal-header-info">
              {selectedMatch.strLeague} • {selectedMatch.strTimestamp}
            </div>
            <div className="modal-scoreboard">
              <div className="modal-team-box">
                <h4>{selectedMatch.strHomeTeam}</h4>
              </div>
              <div className="modal-score-box">
                {selectedMatch.intHomeScore} : {selectedMatch.intAwayScore}
              </div>
              <div className="modal-team-box">
                <h4>{selectedMatch.strAwayTeam}</h4>
              </div>
            </div>
            <div className="modal-stats-footer">
              <p>{selectedMatch.strEvent}</p>
              <div className="status-badge">{selectedMatch.strStatus}</div>
            </div>
          </div>
        </Modal>
      )}

      {selectedNews && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedNews(null)} 
          title="Global Football News"
        >
          <div className="news-content-expanded">
            <h2>{selectedNews.title}</h2>
            <div className="news-divider"></div>
            <p>{selectedNews.content}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};
