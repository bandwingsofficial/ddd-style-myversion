import { io } from 'socket.io-client';
import https from 'https';

// 🔥 HTTPS agent that accepts mkcert / self-signed certs
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const socket = io('https://admin.dev.local:4000/public/categories', {
  transports: ['polling', 'websocket'],
  secure: true,

  // 🔥 THIS IS THE MISSING PIECE
  agent: httpsAgent,
});

socket.on('connect', () => {
  console.log('✅ CONNECTED:', socket.id);
});

socket.on('categories.updated', (data) => {
  console.log('🔥 categories.updated', data);
});

socket.on('connect_error', (err) => {
  console.error('❌ connect_error:', err.message);
});
