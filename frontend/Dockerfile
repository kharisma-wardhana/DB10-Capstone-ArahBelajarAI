# ArahBelajarAI Frontend - Dockerfile
# Node.js 20 + Next.js 16

FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://be-arahbelajarai:8000

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Development mode
CMD ["npm", "run", "dev"]