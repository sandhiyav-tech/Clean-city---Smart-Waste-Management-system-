const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.warn(`[CleanCity Server] Local MongoDB not detected (${err.message}). Starting with In-Memory Demo Database.`);
  }

  app.listen(PORT, () => {
    console.log(`[CleanCity Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[CleanCity Server] Health check: http://localhost:${PORT}/api/health`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

