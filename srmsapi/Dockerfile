FROM node:18-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server/src ./src
COPY server/server.js ./server.js

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]

