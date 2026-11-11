const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[CleanCity Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[CleanCity Server] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[CleanCity Server] Failed to start:', err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

