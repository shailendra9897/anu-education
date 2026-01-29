# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app files
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
RUN npm install -g npm@latest

COPY package*.json ./

RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
