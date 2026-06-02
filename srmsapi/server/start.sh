#!/bin/sh

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
while ! mongosh mongodb://admin:password@mongodb:27017/test -u admin -p password --authenticationDatabase admin --quiet; do
  sleep 1
done
echo "✅ MongoDB is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
while ! redis-cli -h redis -p 6379 ping | grep -q "PONG"; do
  sleep 1
done
echo "✅ Redis is ready"

# Start the Node.js application
echo "🚀 Starting Node.js application..."
exec node src/app.js
