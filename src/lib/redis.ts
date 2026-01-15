import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create Redis client
 * Connects to Redis instance (uses Redis Cloud or local Redis)
 */
export async function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL

  // Validate URL early to avoid redis client's protocol error
  const isValidProtocol = (url?: string) => {
    if (!url) return false
    return url.startsWith('redis://') || url.startsWith('rediss://')
  }

  if (!isValidProtocol(redisUrl)) {
    throw new Error('Invalid or missing REDIS_URL. Expected redis:// or rediss:// protocol.')
  }

  try {
    redisClient = createClient({
      url: redisUrl as string,
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err)
      // In production, you might want to handle this differently
      redisClient = null
    })

    await redisClient.connect()

    return redisClient
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable() {
  try {
    const client = await getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.warn('Redis is not available, will fall back to in-memory storage')
    return false
  }
}
