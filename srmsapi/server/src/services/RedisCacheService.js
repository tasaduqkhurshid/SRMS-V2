"use strict";

const redis = require('redis');
const logger = require('../utils/logger');

// Initialize Redis client
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 0,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger && logger.warn && logger.warn('Redis connection refused, will retry...');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger && logger.error && logger.error('Redis error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger && logger.info && logger.info('Redis connected');
      isConnected = true;
    });

    // Promisify redis client
    redisClient = {
      ...redisClient,
      getAsync: promisify(redisClient.get),
      setAsync: promisify(redisClient.set),
      delAsync: promisify(redisClient.del),
      existsAsync: promisify(redisClient.exists),
      expireAsync: promisify(redisClient.expire)
    };

    return redisClient;
  } catch (error) {
    logger && logger.error && logger.error('Redis initialization error:', error);
    isConnected = false;
  }
};

/**
 * Promisify callback-based function
 */
const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(redisClient, [...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }]);
    });
  };
};

/**
 * Get value from cache
 */
const get = async (key) => {
  try {
    if (!isConnected || !redisClient) return null;
    
    const value = await redisClient.getAsync(key);
    if (value) {
      logger && logger.debug && logger.debug(`Cache HIT: ${key}`);
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
    await redisClient.setAsync(key, serialized);
    
    if (ttl) {
      await redisClient.expireAsync(key, ttl);
    }
    
    logger && logger.debug && logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
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

    const result = await redisClient.delAsync(key);
    logger && logger.debug && logger.debug(`Cache DELETE: ${key}`);
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
    const keys = await new Promise((resolve, reject) => {
      const cursor = '0';
      const matches = [];
      
      const scanRecursive = (cursor) => {
        redisClient.scan(cursor, 'MATCH', pattern, (err, result) => {
          if (err) reject(err);
          else {
            matches.push(...result[1]);
            if (result[0] === '0') {
              resolve(matches);
            } else {
              scanRecursive(result[0]);
            }
          }
        });
      };
      
      scanRecursive(cursor);
    });

    if (keys.length > 0) {
      await redisClient.delAsync(...keys);
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

    const result = await redisClient.existsAsync(key);
    return result === 1;
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

    await new Promise((resolve, reject) => {
      redisClient.flushdb((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    logger && logger.debug && logger.debug('Cache FLUSH');
    return true;
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
