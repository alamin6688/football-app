import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Bell } from 'lucide-react';

export const Navbar = () => {
  const { unreadCount } = useContext(SocketContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Football Pulse
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/live" className="nav-link">Live</Link>
        </div>
        <div className="navbar-actions">
          <Link to="/notifications" className="notification-icon">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};
