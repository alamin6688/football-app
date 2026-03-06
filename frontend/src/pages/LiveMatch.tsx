import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Match } from '../types';
import { Activity, Trophy, Shield, Loader, AlertTriangle } from 'lucide-react';

export const LiveMatch = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const matchIdFromUrl = searchParams.get('matchId');

  const fetchLiveMatches = async () => {
    try {
      const BASE_URL = 'http://localhost:5001/api/matches';
      const response = await fetch(`${BASE_URL}/live`);
      
      if (!response.ok) throw new Error('Live API server unreachable');

      const json = await response.json();
      const data = json.data || [];
      setMatches(data);
      setError(null);
      
      if (matchIdFromUrl) {
        const target = data.find((m: Match) => m.idEvent === matchIdFromUrl);
        if (target) {
          setSelectedMatch(target);
        }
      } else if (!selectedMatch && data.length > 0) {
        setSelectedMatch(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching live matches:', err);
      setError('Live data unavailable on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [matchIdFromUrl]);

  return (
    <div className="live-match-center">
      <div className="live-container">
        {/* Sidebar: Match List */}
        <aside className="match-sidebar">
          <div className="sidebar-header">
            <h3>Live Now</h3>
            <div className="pulse-icon"></div>
          </div>
          
          {error && (
            <div className="sidebar-error">
              <AlertTriangle size={14} className="mr-1" /> {error}
            </div>
          )}

          <div className="match-mini-list">
            {loading ? (
              <div className="mini-loader">
                <Loader className="animate-spin text-accent" size={24} />
                <p>Syncing...</p>
              </div>
            ) : matches.length === 0 ? (
              <p className="empty-text">No matches currently live.</p>
            ) : (
              matches.map((m) => (
                <div 
                  key={m.idEvent} 
                  className={`match-mini-card ${selectedMatch?.idEvent === m.idEvent ? 'active' : ''}`}
                  onClick={() => setSelectedMatch(m)}
                >
                  <div className="mini-teams">
                    <div className="mini-team">
                      <span>{m.strHomeTeam}</span>
                    </div>
                    <div className="mini-team">
                      <span>{m.strAwayTeam}</span>
                    </div>
                  </div>
                  <div className="mini-score">
                    {m.intHomeScore || '0'} - {m.intAwayScore || '0'}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content: Match Detail */}
        <main className="match-detail-view">
          {selectedMatch ? (
            <div className="detail-canvas">
              <div className="detail-scoreboard-card">
                <div className="league-chip">{selectedMatch.strLeague}</div>
                <div className="large-scoreboard">
                  <div className="large-team">
                    <div className="team-icon-circle shadow-accent">
                      <Shield size={40} className="text-accent" />
                    </div>
                    <h2>{selectedMatch.strHomeTeam}</h2>
                  </div>
                  
                  <div className="large-score-area">
                    <div className="score-main">{selectedMatch.intHomeScore || '0'} : {selectedMatch.intAwayScore || '0'}</div>
                    <div className="time-badge">{selectedMatch.strStatus}</div>
                  </div>

                  <div className="large-team">
                    <div className="team-icon-circle shadow-secondary">
                      <Shield size={40} className="text-secondary" />
                    </div>
                    <h2>{selectedMatch.strAwayTeam}</h2>
                  </div>
                </div>
              </div>

              <div className="match-insights">
                <div className="insight-card">
                  <div className="card-header">
                    <Activity size={18} />
                    <h4>Live Feed</h4>
                  </div>
                  <div className="timeline-list">
                    <div className="timeline-item highlight">
                      <span className="time">Event</span>
                      <p>{selectedMatch.strEvent}</p>
                    </div>
                    <div className="timeline-item">
                      <span className="time">Status</span>
                      <p>{selectedMatch.strStatus}</p>
                    </div>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="card-header">
                    <Trophy size={18} />
                    <h4>Game Timeline</h4>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Match Ref</label>
                      <span>{selectedMatch.idEvent}</span>
                    </div>
                    <div className="info-item">
                      <label>League</label>
                      <span className="status-live">{selectedMatch.strLeague}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="not-selected-state">
              <Trophy size={64} className="opacity-20 mb-4" />
              <h3>Stadium Connectivity Ready</h3>
              <p>Pick a live match from the left menu to enter the live scoreboard.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
