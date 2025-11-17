# Pre-Deployment Checklist

Complete these steps before running `kamal setup`:

## ✅ Files Ready
- [x] Dockerfile
- [x] deploy.yml
- [x] nginx.conf
- [x] supervisord.conf
- [x] .kamal/secrets.example
- [x] backend/config/master.key
- [x] /up health check endpoint

## 📋 What You Need to Do Now

### 1. Install Kamal (if not installed)
```bash
gem install kamal
```

### 2. Configure deploy.yml
Edit `deploy.yml` and replace:
- `your-username` → Your Docker Hub username (or GitHub username for ghcr.io)
- `YOUR_SERVER_IP` → Your server's IP address (e.g., 192.168.1.100)
- `your-domain.com` → Your domain name (or remove `proxy:` section if no domain)

**For GitHub Container Registry (ghcr.io), use:**
```yaml
registry:
  server: ghcr.io
  username: your-github-username
  password:
    - KAMAL_REGISTRY_PASSWORD
```

### 3. Set Up Secrets
```bash
# Copy the example file
cp .kamal/secrets.example .kamal/secrets

# Edit .kamal/secrets and fill in:
nano .kamal/secrets  # or use your preferred editor
```

**Required values:**
- `KAMAL_REGISTRY_PASSWORD` - Docker Hub password OR GitHub Personal Access Token (with read:packages, write:packages permissions)
- `POSTGRES_PASSWORD` - Strong password for PostgreSQL (e.g., generate with `openssl rand -base64 32`)
- `SECRET_KEY_BASE` - Generate with: `cd backend && bin/rails secret`
- `SENTRY_DSN` - Optional: from https://sentry.io (create Rails project)
- `NEXT_PUBLIC_SENTRY_DSN` - Optional: from https://sentry.io (create Next.js project)
- `NEXT_PUBLIC_POSTHOG_KEY` - Optional: from https://posthog.com

### 4. Prepare Your Server
Make sure you can SSH to your server:
```bash
ssh root@YOUR_SERVER_IP
```

If SSH doesn't work:
- Add your SSH key: `ssh-copy-id root@YOUR_SERVER_IP`
- Or use password authentication (less secure)

Ensure ports 80 and 443 are open:
```bash
# On Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # Keep SSH open!
```

### 5. Build Test (Optional but Recommended)
Test the Docker build locally:
```bash
docker build -t trello-test .
```

This will catch any build errors before deploying.

## 🚀 Deploy Commands

### Initial Deployment
```bash
kamal setup
```

This will:
1. Install Docker on your server
2. Set up PostgreSQL and Redis
3. Build and push your Docker image
4. Deploy the application
5. Set up SSL (if domain configured)

**First deployment takes 10-15 minutes.**

### Subsequent Deployments
```bash
kamal deploy
```

### Common Issues During Setup

**Issue: "Permission denied (publickey)"**
```bash
ssh-copy-id root@YOUR_SERVER_IP
```

**Issue: "Cannot connect to Docker registry"**
- Check KAMAL_REGISTRY_PASSWORD in .kamal/secrets
- For GitHub: Use Personal Access Token, not password
- For Docker Hub: Use Access Token from https://hub.docker.com/settings/security

**Issue: "Image build failed"**
- Run `docker build -t test .` locally to see the error
- Check that all package.json and Gemfile dependencies are correct

**Issue: "Healthcheck failed"**
- Check logs: `kamal app logs`
- Verify DATABASE_URL is correct in secrets
- Ensure /up endpoint exists (already added)

## 📊 Post-Deployment

After successful deployment:

1. **Visit your app:**
   - With domain: https://your-domain.com
   - Without domain: http://YOUR_SERVER_IP

2. **Check status:**
   ```bash
   kamal app details
   kamal accessory details db
   kamal accessory details redis
   ```

3. **View logs:**
   ```bash
   kamal app logs -f
   ```

4. **Run migrations (if needed):**
   ```bash
   kamal migrate
   ```

5. **Open Rails console:**
   ```bash
   kamal console
   ```

## 🔄 Making Updates

After code changes:
```bash
git add .
git commit -m "Your changes"
kamal deploy
```

## 🆘 Rollback

If something goes wrong:
```bash
kamal rollback
```

## 💰 Cost Estimate

- **VPS Server**: $5-20/month (DigitalOcean, Hetzner, etc.)
- **Domain**: $10-15/year (optional)
- **Sentry**: Free tier (5k errors/month)
- **PostHog**: Free tier (1M events/month)

---

**Ready to deploy? Run:** `kamal setup`
