import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'goal' | 'news' | 'match_start' | 'card';
  message: string;
  time: string;
  read: boolean;
  matchId?: string;
}

interface SocketContextData {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const SocketContext = createContext<SocketContextData>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Ensuring clean handshake with websocket fallback
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    newSocket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
