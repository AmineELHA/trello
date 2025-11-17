# Deployment Instructions

This document provides step-by-step instructions for deploying the Trello Clone application using Kamal 2.

## Prerequisites

1. A server with Ubuntu 20.04+ (VPS from DigitalOcean, Hetzner, AWS, etc.)
2. Ruby installed locally (for running Kamal)
3. Docker registry account (Docker Hub, GitHub Container Registry, etc.)
4. Domain name pointed to your server (optional, for SSL)
5. SSH access to your server

## Installation

Install Kamal 2 globally:

```bash
gem install kamal
```

## Configuration

### 1. Update `deploy.yml`

Edit the `deploy.yml` file in the root directory:

- Replace `your-username` with your Docker registry username
- Replace `YOUR_SERVER_IP` with your server's IP address
- Replace `your-domain.com` with your domain (or remove `proxy` section for no SSL)

### 2. Set up secrets

Copy the example secrets file:

```bash
cp .kamal/secrets.example .kamal/secrets
```

Edit `.kamal/secrets` and fill in:

- `KAMAL_REGISTRY_PASSWORD`: Your Docker registry password/token
- `POSTGRES_PASSWORD`: A strong password for PostgreSQL
- `SECRET_KEY_BASE`: Generate with `cd backend && bin/rails secret`
- `SENTRY_DSN`: Backend Sentry DSN from https://sentry.io (create a Rails project)
- `NEXT_PUBLIC_SENTRY_DSN`: Frontend Sentry DSN from https://sentry.io (create a Next.js project)
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog API key from https://posthog.com

Make sure `.kamal/secrets` is in your `.gitignore`.

### 3. Prepare your server

Kamal will automatically install Docker on your server, but make sure:

- You can SSH to your server as root: `ssh root@YOUR_SERVER_IP`
- Your SSH key is added to the server
- Port 80 and 443 are open in your firewall

## Deployment

### Initial Setup

Initialize accessories (PostgreSQL and Redis) and deploy:

```bash
kamal setup
```

This will:
- Install Docker on your server (if needed)
- Build and push your Docker image
- Start PostgreSQL and Redis containers
- Deploy your application container
- Set up nginx to route traffic
- Configure SSL with Let's Encrypt (if domain configured)

### Subsequent Deployments

For updates after the initial setup:

```bash
kamal deploy
```

This will build, push, and deploy the new version with zero-downtime.

## Common Commands

```bash
# View application logs
kamal app logs -f

# Open Rails console
kamal console

# Run database migrations
kamal migrate

# SSH into the container
kamal shell

# Restart the application
kamal app restart

# Check container status
kamal app details

# View accessory (DB/Redis) logs
kamal accessory logs db -f
kamal accessory logs redis -f

# Rollback to previous version
kamal rollback
```

## Architecture

The deployment uses:

- **Nginx** (port 80): Routes traffic to Rails (port 3000) or Next.js (port 3001)
- **Rails backend** (port 3000): GraphQL API and WebSocket (Action Cable)
- **Next.js frontend** (port 3001): Server-side rendered React app
- **PostgreSQL**: Database (managed by Kamal as accessory)
- **Redis**: Cache and Action Cable adapter (managed by Kamal as accessory)
- **Supervisor**: Manages Rails, Next.js, and Nginx processes

All services run in a single Docker container for simplicity.

## Security

1. Never commit `.kamal/secrets` or `config/master.key` to version control
2. Use strong, unique passwords for database access
3. Kamal automatically sets up SSL with Let's Encrypt if domain is configured
4. Regularly update the base Docker images
5. Monitor your app for security vulnerabilities

## Troubleshooting

### Container won't start

```bash
kamal app logs
```

### Database connection issues

Check if PostgreSQL accessory is running:

```bash
kamal accessory details db
```

### SSL certificate issues

Make sure your domain DNS is pointing to the server before running `kamal setup`.

### Check healthcheck status

```bash
kamal app exec 'curl localhost/up'
```

## Custom Domain

To use a custom domain:

1. Point your domain's A record to your server IP
2. Update `proxy.host` in `deploy.yml`
3. Run `kamal setup` or `kamal deploy`

Kamal will automatically obtain SSL certificates via Let's Encrypt.

## Monitoring and Analytics

The application includes integrated error tracking and analytics:

- **Sentry**: Error tracking for both frontend and backend
- **PostHog**: Product analytics and user behavior tracking

See [MONITORING.md](MONITORING.md) for detailed setup instructions.

## Environment Variables

Edit `deploy.yml` to add more environment variables under the `env` section.