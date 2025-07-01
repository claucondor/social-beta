import { serve } from '@hono/node-server';
import { config } from './config';
import app from './api/routes';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
const port = config.app.port;

console.log(`🚀 Starting La Red de Autómatas Backend...`);
console.log(`📱 Environment: ${config.app.nodeEnv}`);
console.log(`🌐 Port: ${port}`);
console.log(`📦 GCP Project: ${config.gcp.projectId}`);
console.log(`⛓️  Flow Network: ${config.flow.network}`);

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  console.log(`✅ Server is running on port ${info.port}`);
  console.log(`📚 API Documentation: http://localhost:${info.port}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${info.port}/health`);
  console.log(`🔗 Backend URL: http://localhost:${info.port}`);
});