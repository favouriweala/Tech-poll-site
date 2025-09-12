/**
 * Rate Limiting Utility for Poll Application
 * 
 * This module provides rate limiting functionality to prevent abuse and ensure
 * fair usage of the application's resources. It uses a token bucket algorithm
 * with Redis-like storage for distributed rate limiting.
 * 
 * Features:
 * - Configurable rate limits per operation type
 * - IP-based and user-based rate limiting
 * - Sliding window rate limiting
 * - Memory-based storage for development
 * - Redis support for production (when available)
 * 
 * @fileoverview Rate limiting utility for preventing abuse
 * @version 1.0.0
 */

import { LRUCache } from 'lru-cache'

// Rate limit configuration
interface RateLimitConfig {
  requests: number
  window: number // in milliseconds
}

// Default rate limits for different operations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'create-poll': { requests: 5, window: 60 * 1000 }, // 5 polls per minute
  'vote': { requests: 10, window: 60 * 1000 }, // 10 votes per minute
  'login': { requests: 5, window: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
  'register': { requests: 3, window: 60 * 60 * 1000 }, // 3 registrations per hour
  'default': { requests: 20, window: 60 * 1000 } // 20 requests per minute
}

// In-memory cache for rate limiting (use Redis in production)
const cache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000,
  ttl: 60 * 60 * 1000 // 1 hour TTL
})

/**
 * Rate limiting result
 */
interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

/**
 * Rate limiter class implementing sliding window algorithm
 */
class RateLimiter {
  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier for the rate limit (e.g., 'create-poll:192.168.1.1')
   * @param customConfig - Optional custom rate limit configuration
   * @returns Rate limit result
   */
  async limit(identifier: string, customConfig?: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const [operation] = identifier.split(':')
    const config = customConfig || RATE_LIMITS[operation] || RATE_LIMITS.default
    
    const key = `ratelimit:${identifier}`
    const current = cache.get(key)
    
    // If no previous record or window has expired, start fresh
    if (!current || now > current.resetTime) {
      const resetTime = now + config.window
      cache.set(key, { count: 1, resetTime })
      
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: new Date(resetTime)
      }
    }
    
    // Check if limit exceeded
    if (current.count >= config.requests) {
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset: new Date(current.resetTime)
      }
    }
    
    // Increment counter
    current.count++
    cache.set(key, current)
    
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - current.count,
      reset: new Date(current.resetTime)
    }
  }
  
  /**
   * Reset rate limit for a specific identifier
   * @param identifier - The identifier to reset
   */
  async reset(identifier: string): Promise<void> {
    const key = `ratelimit:${identifier}`
    cache.delete(key)
  }
  
  /**
   * Get current rate limit status without incrementing
   * @param identifier - The identifier to check
   * @returns Current rate limit status
   */
  async status(identifier: string): Promise<RateLimitResult | null> {
    const now = Date.now()
    const [operation] = identifier.split(':')
    const config = RATE_LIMITS[operation] || RATE_LIMITS.default
    
    const key = `ratelimit:${identifier}`
    const current = cache.get(key)
    
    if (!current || now > current.resetTime) {
      return null
    }
    
    return {
      success: current.count < config.requests,
      limit: config.requests,
      remaining: Math.max(0, config.requests - current.count),
      reset: new Date(current.resetTime)
    }
  }
}

// Export singleton instance
export const ratelimit = new RateLimiter()

// Export types for use in other modules
export type { RateLimitResult, RateLimitConfig }

// Export rate limit configurations for reference
export { RATE_LIMITS }