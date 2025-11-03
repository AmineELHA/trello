module.exports = {
  apps: [{
    name: 'frontend',
    script: 'server.js',
    cwd: '/app',
    port: 3000,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }, {
    name: 'backend',
    script: './bin/rails',
    cwd: '/backend',
    args: 'server -p 8080',
    env: {
      RAILS_ENV: 'production',
      PORT: 8080
    }
  }]
};