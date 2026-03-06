// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import matchRoutes from './modules/match/match.route'; // your match module

dotenv.config();

const app = express();
const PORT = 5001;

// HTTP server + socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/matches', matchRoutes); // Option A: base path = /api/matches

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io live notifications (optional)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Simulate live events to clients
setInterval(() => {
  const events = [
    { type: 'goal', message: 'GOAL! Bayern Munich scores!', team: 'Bayern', matchId: '77468' },
    { type: 'news', message: 'Breaking: Transfer window updates from the Premier League.', matchId: null },
    { type: 'match_start', message: 'Kickoff: Real Madrid vs Valencia has started.', matchId: 'spa1' },
    { type: 'card', message: 'Red Card for Dortmund midfielder!', matchId: '77465' },
  ];

  const randomEvent = events[Math.floor(Math.random() * events.length)];

  io.emit('notification', {
    id: Date.now().toString(),
    ...randomEvent,
    time: new Date().toLocaleTimeString(),
    read: false,
  });
}, 20000);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});