import { io } from 'socket.io-client';

const OUTLET_ID = 'be840d38-f997-4a3d-81d8-e920681f1dd4';

const socket = io('http://localhost:4000/public/outlets', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ connected:', socket.id);

  console.log('➡️ joining outlet room:', OUTLET_ID);
  socket.emit('join_outlet', { outletId: OUTLET_ID });
});

socket.onAny((event, data) => {
  console.log('📩 received:', event, data);
});
