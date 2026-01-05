import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,

  // 🔑 THIS IS THE WALL BETWEEN PROJECTS
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'inkhub_ecomm:',

  connectTimeout: 5000,
  maxRetriesPerRequest: 1,
  lazyConnect: true, // PERF: Don't connect immediately, connect on first use
  retryStrategy: () => null, // PERF: Don't retry on connection failure
  enableOfflineQueue: false, // PERF: Don't queue commands when offline
})

redis.on('connect', () => {
  console.log('✅ Redis connected (NEW PROJECT)')
})

redis.on('ready', () => {
  console.log('🚀 Redis ready (NEW PROJECT)')
})

// PERF: Only log Redis errors once to reduce console noise
let errorLogged = false
redis.on('error', (err) => {
  if (!errorLogged) {
    console.warn('⚠️ Redis not available (NEW PROJECT):', err.message)
    errorLogged = true
  }
})
// Graceful shutdown
const shutdownRedis = async () => {
  console.log('🔄 Shutting down Redis (NEW PROJECT)...');
  try {
    await redis.quit();
    console.log('✅ Redis shutdown complete (NEW PROJECT)');
  } catch (err) {
    console.error('❌ Error during Redis shutdown:', err);
  }
};

process.on('SIGINT', shutdownRedis);
process.on('SIGTERM', shutdownRedis);


export default redis
