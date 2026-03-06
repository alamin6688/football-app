import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import type { Notification } from '../context/SocketContext';
import { BellRing, Goal, Newspaper, AlarmClock, ExternalLink, ChevronRight } from 'lucide-react';

export const Notifications = () => {
  const { notifications, markAsRead } = useContext(SocketContext);
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Goal className="text-accent" />;
      case 'news': return <Newspaper className="text-secondary" />;
      case 'card': return <BellRing className="text-red-500" />;
      default: return <AlarmClock className="text-accent" />;
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.type === 'goal' || notif.type === 'match_start' || notif.type === 'card') {
      const targetUrl = notif.matchId ? `/live?matchId=${notif.matchId}` : '/live';
      navigate(targetUrl);
    } else if (notif.type === 'news') {
      navigate('/');
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Recent Notifications</h1>
        <div className="badge-pill">{notifications.length} Alerts</div>
      </div>

      <div className="notif-list-container">
        {notifications.length === 0 ? (
          <div className="empty-notif-state">
            <BellRing size={60} className="text-secondary opacity-30 mb-4" />
            <p>Your notification tray is empty.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notif-item-card ${!notif.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notif-type-icon">
                {getIcon(notif.type)}
              </div>
              <div className="notif-body">
                <p className="notif-msg">{notif.message}</p>
                <div className="notif-meta">
                  <span className="notif-timestamp">{notif.time}</span>
                  {!notif.read && <span className="new-tag">NEW</span>}
                </div>
              </div>
              <div className="notif-go-icon">
                <ExternalLink size={18} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="notif-footer-hint">
        <p><ChevronRight size={14} className="inline mr-1" /> Click on an alert to see details.</p>
      </div>
    </div>
  );
};
