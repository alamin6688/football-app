import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Notifications } from './pages/Notifications';
import { LiveMatch } from './pages/LiveMatch';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={<LiveMatch />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
