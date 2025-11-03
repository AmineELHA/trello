# Use the official Node.js image
FROM node:25-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Copy the built application and dependencies from the base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Expose port 3001
EXPOSE 3001

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]