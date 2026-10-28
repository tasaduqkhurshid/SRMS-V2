"use strict";

const redis = require('redis');
const logger = require('../utils/logger');
const { getTenantContext } = require('../middleware/tenantContext');

const scopedCacheKey = (key) => `${getTenantContext()?.schoolId || 'global'}:${key}`;

// Initialize Redis client
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Redis retry limit reached');
          return Math.min(retries * 100, 3000);
        },
      },
      database: Number(process.env.REDIS_DB || 0),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      logger && logger.error && logger.error('Redis error:', err);
      isConnected = false;
    });

    redisClient.on('ready', () => {
      logger && logger.info && logger.info('Redis connected');
      isConnected = true;
    });
    redisClient.on('end', () => { isConnected = false; });

    await redisClient.connect();
    isConnected = redisClient.isReady;

    return redisClient;
  } catch (error) {
    logger && logger.error && logger.error('Redis initialization error:', error);
    isConnected = false;
  }
};

/**
 * Get value from cache
 */
const get = async (key) => {
  try {
    if (!isConnected || !redisClient) return null;

    const cacheKey = scopedCacheKey(key);
    const value = await redisClient.get(cacheKey);
    if (value) {
      logger && logger.debug && logger.debug(`Cache HIT: ${cacheKey}`);
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    logger && logger.error && logger.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in cache with TTL
 */
const set = async (key, value, ttl = 3600) => {
  try {
    if (!isConnected || !redisClient) return false;

    const serialized = JSON.stringify(value);
    const cacheKey = scopedCacheKey(key);
    await redisClient.set(cacheKey, serialized, ttl ? { EX: ttl } : {});
    
    logger && logger.debug && logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger && logger.error && logger.error(`Redis SET error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete cache key
 */
const del = async (key) => {
  try {
    if (!isConnected || !redisClient) return false;

    const cacheKey = scopedCacheKey(key);
    const result = await redisClient.del(cacheKey);
    logger && logger.debug && logger.debug(`Cache DELETE: ${cacheKey}`);
    return result > 0;
  } catch (error) {
    logger && logger.error && logger.error(`Redis DEL error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete multiple cache keys by pattern
 */
const deleteByPattern = async (pattern) => {
  try {
    if (!isConnected || !redisClient) return 0;

    // Get all keys matching pattern
    const scopedPattern = scopedCacheKey(pattern);
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: scopedPattern, COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger && logger.debug && logger.debug(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    logger && logger.error && logger.error(`Redis DELETE pattern error for ${pattern}:`, error);
    return 0;
  }
};

/**
 * Check if key exists
 */
const exists = async (key) => {
  try {
    if (!isConnected || !redisClient) return false;

    const result = await redisClient.exists(scopedCacheKey(key));
    return result > 0;
  } catch (error) {
    logger && logger.error && logger.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
};

/**
 * Get or set cache (get if exists, else call factory function and cache result)
 */
const getOrSet = async (key, factory, ttl = 3600) => {
  try {
    // Try to get from cache first
    const cached = await get(key);
    if (cached) {
      return cached;
    }

    // Call factory function to get fresh data
    const data = await factory();

    // Cache the result
    if (data) {
      await set(key, data, ttl);
    }

    return data;
  } catch (error) {
    logger && logger.error && logger.error(`Redis getOrSet error for key ${key}:`, error);
    // Return null if error, let caller handle it
    return null;
  }
};

/**
 * Clear all cache
 */
const clear = async () => {
  try {
    if (!isConnected || !redisClient) return false;

    return await deleteByPattern('*') >= 0;
  } catch (error) {
    logger && logger.error && logger.error('Redis FLUSH error:', error);
    return false;
  }
};

/**
 * Get Redis connection status
 */
const isReady = () => isConnected && redisClient;

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  deleteByPattern,
  exists,
  getOrSet,
  clear,
  isReady
};
