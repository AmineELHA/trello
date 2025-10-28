# Deploying Trello Clone to Fly.io

This document provides instructions for deploying the Trello clone application to Fly.io.

## Prerequisites

1. Install the Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Have a Fly.io account (sign up at https://fly.io)
3. Have Docker installed on your machine

## Deployment Steps

### 1. Deploy the Database

First, create and deploy the PostgreSQL database:

```bash
# Initialize the database app
flyctl launch --config fly.database.toml --no-deploy

# Set a password for the database (optional but recommended)
flyctl secrets set POSTGRES_PASSWORD=your_secure_password --app trello-db

# Deploy the database
flyctl deploy --config fly.database.toml
```

### 2. Generate Secret Key for Rails

Before deploying the backend, you need to generate a SECRET_KEY_BASE for Rails:

```bash
# Generate a secret key
ruby -r securerandom -e 'puts SecureRandom.hex(64)'
```

### 3. Deploy the Backend

```bash
# Navigate to the backend directory
cd backend

# Initialize the app if this is your first time
flyctl launch --org your-org-name --no-deploy

# Set environment variables
flyctl secrets set \
  SECRET_KEY_BASE=your_generated_secret_key \
  DB_HOST=trello-db.internal \
  DB_NAME=trello_production \
  DB_USERNAME=postgres \
  DB_PASSWORD=your_db_password \
  FRONTEND_URL=https://trello-frontend.fly.dev \
  RAILS_HOST=trello-backend.fly.dev \
  --app trello-backend

# Deploy the backend
flyctl deploy --app trello-backend

# Run database migrations
flyctl ssh console --app trello-backend
# Inside the console:
# /rails/bin/rails db:create db:migrate
```

### 4. Deploy the Frontend

```bash
# Navigate to the frontend directory
cd ../frontend

# Initialize the app if this is your first time
flyctl launch --org your-org-name --no-deploy

# Set environment variables
flyctl secrets set \
  NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://trello-backend.fly.dev/graphql \
  BACKEND_URL=https://trello-backend.fly.dev \
  --app trello-frontend

# Deploy the frontend
flyctl deploy --app trello-frontend
```

## Post-Deployment Steps

### 1. Configure Database

Connect to your backend instance and run the database migrations:

```bash
flyctl ssh console --app trello-backend
# Inside the console:
# cd /rails
# bin/rails db:create db:migrate
```

### 2. Verify Deployment

- Backend GraphQL endpoint: https://trello-backend.fly.dev/graphql
- Frontend application: https://trello-frontend.fly.dev
- Database: trello-db.fly.dev

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Ensure the DB_HOST is set correctly to your database's internal address.

2. **Migration Failures**: Make sure the database exists and is accessible before running migrations.

3. **Environment Variables**: Double-check that all required environment variables are set.

4. **SSL/HTTPS Issues**: Both services are configured for HTTPS by default, which Fly.io handles automatically.

### Useful Commands

```bash
# Check application logs
flyctl logs --app trello-backend
flyctl logs --app trello-frontend

# SSH into your running machines
flyctl ssh console --app trello-backend
flyctl ssh console --app trello-frontend

# Check application status
flyctl status --app trello-backend
flyctl status --app trello-frontend

# Redeploy if needed
flyctl deploy --app trello-backend
flyctl deploy --app trello-frontend
```

## Scaling

To scale your application:

```bash
# Scale backend
flyctl scale count 2 --app trello-backend

# Scale frontend
flyctl scale count 2 --app trello-frontend
```

## Configuration Reference

### Backend Environment Variables

- `SECRET_KEY_BASE`: Rails secret key (required)
- `DB_HOST`: Database host address (required)
- `DB_NAME`: Database name (required)
- `DB_USERNAME`: Database username (required)
- `DB_PASSWORD`: Database password (required)
- `FRONTEND_URL`: URL of the frontend application
- `RAILS_HOST`: Host for the Rails application
- `RAILS_ENV`: Rails environment (production by default)

### Frontend Environment Variables

- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: URL of the GraphQL endpoint
- `BACKEND_URL`: URL of the backend service
- `NODE_ENV`: Node environment (production by default)

## Notes

- The application uses a microservices architecture with separate deployments for frontend and backend
- Both services are configured with HTTPS enabled by default
- The database uses Fly.io's PostgreSQL image with encrypted connections
- The Rails backend handles authentication and data storage
- The Next.js frontend provides the user interface and communicates with the backend via GraphQL