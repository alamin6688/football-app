import { useState, useEffect, useContext } from 'react';
import type { Match, NewsItem } from '../types';
import { Modal } from '../components/Modal';
import { Activity, Calendar, Trophy, Newspaper, ChevronRight, Loader, Wifi, WifiOff } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

export const Dashboard = () => {
  const { socket } = useContext(SocketContext);
  const [liveScores, setLiveScores] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const BASE_URL = 'http://localhost:5001/api/matches';

  const fetchSection = async (endpoint: string, setter: (data: any) => void) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (res.ok) {
        const json = await res.json();
        setter(json.data || json.mockNews || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}`, err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    // Fetch live scores first for priority
    await fetchSection('/live', setLiveScores);
    
    // Fetch others in parallel without blocking UI
    Promise.all([
      fetchSection('/recent/4331', setRecentResults),
      fetchSection('/upcoming/4331', setUpcomingMatches),
      fetchSection('/latest-news', setNews)
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 60000); // Polling as fallback

    if (socket) {
      setIsConnected(socket.connected);
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.on('notification', () => {
        // Refresh live data when a goal or event notification arrives
        fetchSection('/live', setLiveScores);
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('notification');
      }
    };
  }, [socket]);

  return (
    <div className="dashboard-container">
      <header className="hero-section">
        <div className="flex justify-between items-center mb-4">
          <div className="status-indicator">
            {isConnected ? (
              <span className="flex items-center text-green-500 text-sm"><Wifi size={14} className="mr-1"/> Live Pipeline Connected</span>
            ) : (
              <span className="flex items-center text-red-400 text-sm"><WifiOff size={14} className="mr-1"/> Reconnecting to Stadium...</span>
            )}
          </div>
        </div>
        <h1 className="hero-title">Football Pulse</h1>
        <p className="hero-subtitle">Real-time stadium updates and modular match insights.</p>
      </header>

      <div className="dashboard-grid">
        {/* Live Scores */}
        <section className="section-card">
          <div className="section-header">
            <Activity className="text-accent" size={20} />
            <h2>Live Scores</h2>
          </div>
          <div className="match-list">
            {loading && liveScores.length === 0 ? <Loader className="animate-spin mx-auto my-4" /> : 
             liveScores.length > 0 ? liveScores.map((match) => (
              <div className="match-card" key={`live-${match.idEvent}`}>
                <div className="team"><span>{match.strHomeTeam}</span></div>
                <div className="score-box">
                  <div className="score">{match.intHomeScore || '0'} - {match.intAwayScore || '0'}</div>
                  <div className="match-time live-badge">{match.strStatus}</div>
                </div>
                <div className="team right"><span>{match.strAwayTeam}</span></div>
              </div>
            )) : <p className="empty-msg">Waiting for kick-off...</p>}
          </div>
        </section>

        {/* Recent & Upcoming (Combined logic for brevity) */}
        <section className="section-card">
          <div className="section-header">
            <Trophy className="text-secondary" size={20} />
            <h2>Recent Results</h2>
          </div>
          <div className="match-list">
            {recentResults.slice(0, 3).map((match) => (
              <div className="match-card clickable" key={`recent-${match.idEvent}`} onClick={() => setSelectedMatch(match)}>
                <div className="team"><span>{match.strHomeTeam}</span></div>
                <div className="score-box">
                  <div className="score">{match.intHomeScore} - {match.intAwayScore}</div>
                  <div className="match-time date-badge">{match.strTimestamp?.split(' ')[0]}</div>
                </div>
                <div className="team right"><span>{match.strAwayTeam}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="section-header">
            <Calendar className="text-accent" size={20} />
            <h2>Upcoming</h2>
          </div>
          <div className="match-list">
            {upcomingMatches.slice(0, 3).map((match) => (
              <div className="match-card" key={`upcoming-${match.idEvent}`}>
                <div className="team"><span>{match.strHomeTeam}</span></div>
                <div className="score-box">
                  <div className="vs-label">VS</div>
                  <div className="match-time date-badge">{match.strTimestamp?.split(' ')[0]}</div>
                </div>
                <div className="team right"><span>{match.strAwayTeam}</span></div>
              </div>
            ))}
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

      {selectedMatch && (
        <Modal isOpen={true} onClose={() => setSelectedMatch(null)} title="Match Review">
          <div className="match-modal-view">
            <div className="modal-header-info">{selectedMatch.strLeague} • {selectedMatch.strTimestamp}</div>
            <div className="modal-scoreboard">
              <div className="modal-team-box"><h4>{selectedMatch.strHomeTeam}</h4></div>
              <div className="modal-score-box">{selectedMatch.intHomeScore} : {selectedMatch.intAwayScore}</div>
              <div className="modal-team-box"><h4>{selectedMatch.strAwayTeam}</h4></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
