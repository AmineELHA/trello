# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for unified frontend + backend deployment

# ============================================
# Stage 1: Build Frontend (Next.js)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ============================================
# Stage 2: Build Backend (Rails)
# ============================================
FROM ruby:3.4.5-slim AS backend-builder

WORKDIR /backend

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    git \
    libpq-dev \
    libyaml-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install gems
COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3 && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Copy application code
COPY backend/ ./

# Precompile bootsnap for faster boot times
RUN bundle exec bootsnap precompile --gemfile app/ lib/

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM ruby:3.4.5-slim

WORKDIR /app

# Install runtime dependencies: Node.js, PostgreSQL client, nginx
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    curl \
    libjemalloc2 \
    libvips \
    postgresql-client \
    nginx \
    supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install --no-install-recommends -y nodejs && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built backend from builder
COPY --from=backend-builder /usr/local/bundle /usr/local/bundle
COPY --from=backend-builder /backend /app/backend

# Copy built frontend from builder
COPY --from=frontend-builder /frontend/.next/standalone /app/frontend/standalone
COPY --from=frontend-builder /frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-builder /frontend/public /app/frontend/public
COPY --from=frontend-builder /frontend/package.json /app/frontend/

# Copy nginx and supervisor configurations
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/log/supervisor /app/backend/tmp/pids /app/backend/log && \
    groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails /app /var/log/nginx /var/lib/nginx

# Set environment variables
ENV RAILS_ENV=production \
    NODE_ENV=production \
    BUNDLE_PATH="/usr/local/bundle" \
    PATH="/app/backend/bin:${PATH}"

EXPOSE 80

# Use supervisor to manage both Rails and Next.js processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
