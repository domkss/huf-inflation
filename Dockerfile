FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code & build
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

# Copy built project from builder
COPY --from=builder /app .

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
