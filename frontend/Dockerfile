# Use the official Node.js image
FROM node:25-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

# Copy package.json to install production dependencies only
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the built application from the base stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Expose port 3000
EXPOSE 3000

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]