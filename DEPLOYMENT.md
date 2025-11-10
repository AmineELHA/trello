# Deployment Instructions for DigitalOcean

This document provides step-by-step instructions for deploying the Trello Clone application to DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account
2. A GitHub repository containing this codebase
3. A generated `SECRET_KEY_BASE` for Rails
4. (Optional) A domain name if you want to use a custom domain

## Environment Variables Required

Before deploying, you need to set the following environment variables:

### For Rails:
- `SECRET_KEY_BASE`: Generate using `cd backend && bundle exec rake secret`
- `DB_HOST`: Database host (for unified deployment, use "localhost")
- `DB_NAME`: Database name (e.g., "trello_production")
- `DB_USERNAME`: Database username (e.g., "postgres")
- `DB_PASSWORD`: Database password (should be complex)

### For Next.js:
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: URL to your GraphQL endpoint (e.g., "https://your-app.ondigitalocean.app/graphql")

### General:
- `FRONTEND_URL`: URL of your frontend (e.g., "https://your-app.ondigitalocean.app")
- `RAILS_HOST`: URL of your Rails app (e.g., "https://your-app.ondigitalocean.app")

## Deployment Steps

### Option 1: Using DigitalOcean App Platform (Recommended)

1. **Prepare your GitHub repository**:
   - Make sure all files in this repository are committed to your GitHub repo
   - Ensure `Dockerfile.unified`, `entrypoint.sh`, and `nginx.conf` are in the root directory

2. **Log in to DigitalOcean**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"

3. **Connect your repository**:
   - Click "GitHub" to connect your GitHub account
   - Select your repository containing this Trello Clone code

4. **Configure your app**:
   - DigitalOcean should detect the Dockerfile automatically
   - Set the HTTP port to `3000`
   - Set the Run Command to `/entrypoint.sh`
   - Select the `Dockerfile.unified` as your Dockerfile

5. **Set environment variables**:
   - Add all the required environment variables mentioned above
   - Mark sensitive values (like `DB_PASSWORD` and `SECRET_KEY_BASE`) as "Secret"

6. **Configure resources**:
   - Select an appropriate instance size (at least basic-xxs for development)
   - The unified approach runs both frontend and backend in one container

7. **Deploy**:
   - Click "Next" and then "Create Resources"
   - Wait for the build and deployment to complete
   - Your app will be accessible at a URL like `https://your-app-name.ondigitalocean.app`

### Option 2: Manual Deployment to a Droplet

1. **Create a DigitalOcean Droplet**:
   - Create a new Ubuntu 22.04 droplet (recommended: at least 2GB RAM)
   - SSH into your droplet

2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-v2
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

3. **Clone your repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

4. **Build and run the Docker container**:
   ```bash
   # Build the image
   docker build -t trello-unified -f Dockerfile.unified .

   # Run the container
   docker run -d \
     --name trello-app \
     -p 3000:3000 \
     -e RAILS_ENV=production \
     -e NODE_ENV=production \
     -e DB_HOST=localhost \
     -e DB_NAME=trello_production \
     -e DB_USERNAME=postgres \
     -e DB_PASSWORD=your_secure_password \
     -e SECRET_KEY_BASE=your_generated_secret \
     -e FRONTEND_URL=http://your-droplet-ip:3000 \
     -e RAILS_HOST=http://your-droplet-ip:3000 \
     -e NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://your-droplet-ip:3000/graphql \
     trello-unified
   ```

5. **Set up a reverse proxy (optional but recommended)**:
   - Install and configure Nginx to handle HTTPS and provide a custom domain

## Architecture Notes

This deployment uses a unified Docker approach where:
- Both the Next.js frontend and Rails API backend run in the same container
- Nginx acts as a reverse proxy to route requests appropriately
- API requests (like `/graphql`) are routed to the Rails backend
- Static assets and frontend routes are served by Next.js
- A PostgreSQL database runs in the same container (for unified deployment)

## Important Security Notes

1. Never commit `config/master.key` or other sensitive files to version control
2. Always use strong, unique passwords for database access
3. Use HTTPS in production
4. Regularly update the base Docker images
5. Monitor your app for security vulnerabilities

## Troubleshooting

### If the app fails to start:
- Check the DigitalOcean logs in the App Platform dashboard
- Make sure all required environment variables are set
- Verify the SECRET_KEY_BASE is correctly generated

### Database issues:
- Ensure the database is properly initialized
- Check that database credentials are correct
- Verify the database is accessible from within the container

### Frontend/Backend communication issues:
- Verify that NEXT_PUBLIC_GRAPHQL_ENDPOINT points to the correct location
- Check that CORS settings (if any) allow the necessary requests

## Scaling

For production deployments with high traffic, consider:
- Moving the database to DigitalOcean's Managed Database service
- Using separate containers for frontend, backend, and database
- Adding a CDN for static assets
- Implementing caching layers as needed