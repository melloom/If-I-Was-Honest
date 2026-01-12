import { getRedisClient } from './redis'

// Fallback in-memory rate limiter (used when Redis is unavailable)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const postTimestamps = new Map<string, number[]>() // Track post times for smart limiting

interface RateLimitConfig {
  max: number // Maximum requests
  window: number // Time window in seconds
}

interface SmartPostLimitConfig {
  maxPerMinute: number // Prevent rapid spam
  maxPerHour: number // Hourly limit
  maxPerDay: number // Daily limit
  burstAllowance: number // Allow short bursts
}

export class RateLimiter {
  private config: RateLimitConfig
  private useRedis: boolean | null = null

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private async initializeRedis() {
    try {
      const client = await getRedisClient()
      await client.ping()
      this.useRedis = true
    } catch (error) {
      console.warn('Redis not available, falling back to in-memory rate limiting')
      this.useRedis = false
    }
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    try {
      if (this.useRedis === null) {
        await this.initializeRedis()
      }
      if (this.useRedis) {
        return await this.checkRedis(identifier)
      }
    } catch (error) {
      console.warn('Redis check failed, falling back to in-memory:', error)
      this.useRedis = false
    }
    return this.checkInMemory(identifier)
  }

  private async checkRedis(
    identifier: string
  ): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    try {
      const client = await getRedisClient()
      const now = Date.now()
      const key = `rate-limit:${identifier}`
      const windowMs = this.config.window * 1000
      const resetAt = now + windowMs

      // Get current count
      const current = await client.incr(key)

      // Set expiration on first count
      if (current === 1) {
        await client.expire(key, this.config.window)
      }

      // Check if limit exceeded
      const success = current <= this.config.max
      const remaining = Math.max(0, this.config.max - current)

      return {
        success,
        remaining,
        resetAt,
      }
    } catch (error) {
      console.error('Redis rate limit check error:', error)
      throw error
    }
  }

  private checkInMemory(identifier: string): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const key = identifier
    const windowMs = this.config.window * 1000

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup()
    }

    const existing = rateLimitStore.get(key)

    // No existing record or window expired
    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs
      rateLimitStore.set(key, { count: 1, resetAt })
      return Promise.resolve({
        success: true,
        remaining: this.config.max - 1,
        resetAt,
      })
    }

    // Within rate limit
    if (existing.count < this.config.max) {
      existing.count++
      return Promise.resolve({
        success: true,
        remaining: this.config.max - existing.count,
        resetAt: existing.resetAt,
      })
    }

    // Rate limit exceeded
    return Promise.resolve({
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    })
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }
}

/**
 * Smart rate limiter for posts
 * Allows multiple posts per day but prevents spam
 */
export class SmartPostLimiter {
  private config: SmartPostLimitConfig

  constructor(config: SmartPostLimitConfig) {
    this.config = config
  }

  async check(userId: string): Promise<{
    success: boolean
    reason?: string
    nextAllowedAt?: number
  }> {
    const now = Date.now()
    const key = `post:${userId}`

    // Get or create timestamp array
    let timestamps = postTimestamps.get(key) || []

    // Clean up old timestamps (older than 24 hours)
    const dayAgo = now - (24 * 60 * 60 * 1000)
    timestamps = timestamps.filter(t => t > dayAgo)

    // Check per-minute limit (prevent rapid spam)
    const oneMinuteAgo = now - (60 * 1000)
    const postsLastMinute = timestamps.filter(t => t > oneMinuteAgo).length
    if (postsLastMinute >= this.config.maxPerMinute) {
      return {
        success: false,
        reason: 'Too many posts in the last minute. Please slow down.',
        nextAllowedAt: timestamps[timestamps.length - this.config.maxPerMinute] + (60 * 1000)
      }
    }

    // Check burst allowance (allow 3-4 posts in quick succession, then slow down)
    const fiveMinutesAgo = now - (5 * 60 * 1000)
    const postsLast5Minutes = timestamps.filter(t => t > fiveMinutesAgo).length
    if (postsLast5Minutes >= this.config.burstAllowance) {
      return {
        success: false,
        reason: 'Taking a short break helps prevent spam. Try again in a few minutes.',
        nextAllowedAt: timestamps[timestamps.length - this.config.burstAllowance] + (5 * 60 * 1000)
      }
    }

    // Check hourly limit
    const oneHourAgo = now - (60 * 60 * 1000)
    const postsLastHour = timestamps.filter(t => t > oneHourAgo).length
    if (postsLastHour >= this.config.maxPerHour) {
      return {
        success: false,
        reason: 'You\'ve reached your hourly posting limit. Take a break and reflect.',
        nextAllowedAt: timestamps[timestamps.length - this.config.maxPerHour] + (60 * 60 * 1000)
      }
    }

    // Check daily limit
    if (timestamps.length >= this.config.maxPerDay) {
      return {
        success: false,
        reason: 'Daily posting limit reached. Quality over quantity - take time to reflect.',
        nextAllowedAt: timestamps[0] + (24 * 60 * 60 * 1000)
      }
    }

    // All checks passed - allow the post
    timestamps.push(now)
    postTimestamps.set(key, timestamps)

    // Cleanup old entries periodically
    if (Math.random() < 0.05) {
      this.cleanupOldTimestamps()
    }

    return { success: true }
  }

  private cleanupOldTimestamps() {
    const now = Date.now()
    const dayAgo = now - (24 * 60 * 60 * 1000)

    for (const [key, timestamps] of postTimestamps.entries()) {
      const filtered = timestamps.filter(t => t > dayAgo)
      if (filtered.length === 0) {
        postTimestamps.delete(key)
      } else {
        postTimestamps.set(key, filtered)
      }
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  max: 5, // 5 attempts
  window: 60 * 15, // per 15 minutes
})

export const apiRateLimiter = new RateLimiter({
  max: 100, // 100 requests
  window: 60, // per minute
})

export const signupRateLimiter = new RateLimiter({
  max: 3, // 3 signups
  window: 60 * 60, // per hour
})

export const smartPostLimiter = new SmartPostLimiter({
  maxPerMinute: 2, // Max 2 posts per minute (prevent spam bots)
  maxPerHour: 15, // Max 15 posts per hour (generous for legitimate use)
  maxPerDay: 50, // Max 50 posts per day (very generous)
  burstAllowance: 5, // Allow up to 5 posts in quick succession, then slow down
})

/**
 * Get client identifier (IP or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `ip:${ip}`
}
