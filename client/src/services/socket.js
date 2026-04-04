import io from 'socket.io-client';

import { SOCKET_URL } from '../config/api.js';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    query: { userId }
  });
  
  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners
export const onLocationUpdate = (callback) => {
  if (socket) {
    socket.on('worker-location', callback);
  }
};

export const onTriggerAlert = (callback) => {
  if (socket) {
    socket.on('trigger-alert', callback);
  }
};

export const onClaimUpdate = (callback) => {
  if (socket) {
    socket.on('claim-update', callback);
  }
};

// Event emitters
export const emitLocationUpdate = (location) => {
  if (socket) {
    socket.emit('location-update', location);
  }
};

export const emitStatusUpdate = (status) => {
  if (socket) {
    socket.emit('status-update', status);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  onLocationUpdate,
  onTriggerAlert,
  onClaimUpdate,
  emitLocationUpdate,
  emitStatusUpdate
};