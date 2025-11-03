#!/bin/sh

# Start the Rails server in the background
cd /backend
RAILS_ENV=production /backend/bin/rails server -b 0.0.0.0 -p 8080 &

# Wait a moment for the Rails server to start
sleep 5

# Start the Next.js server
cd /app
NODE_ENV=production PORT=3000 node server.js &
 
# Wait for Next.js server to start
sleep 3

# Start nginx to serve both applications
nginx -g 'daemon off;'