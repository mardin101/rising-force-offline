# Deployment Summary

This document provides a quick overview of the VPS deployment setup that has been added to the repository.

## What Was Added

### 1. GitHub Actions Workflow (`.github/workflows/deploy-vps.yml`)

A new automated deployment workflow that:
- ✅ Triggers automatically on every push to the `main` branch
- ✅ Can also be triggered manually via GitHub Actions UI
- ✅ Connects to your VPS via SSH using GitHub secrets
- ✅ Pulls the latest code from the repository
- ✅ Rebuilds and restarts Docker containers
- ✅ Cleans up unused Docker resources

### 2. VPS Setup Guide (`VPS_SETUP.md`)

A comprehensive guide covering:
- ✅ System prerequisites and requirements
- ✅ Step-by-step Docker installation
- ✅ Step-by-step Docker Compose installation
- ✅ Application directory setup
- ✅ Environment configuration
- ✅ GitHub secrets configuration
- ✅ Firewall setup
- ✅ Initial deployment steps
- ✅ Troubleshooting common issues
- ✅ Advanced security configurations (SSH keys)
- ✅ Maintenance tasks and best practices

### 3. Updated Documentation

- ✅ Updated `README.md` to reference the VPS setup guide

## Quick Start - What You Need to Do

### Step 1: Prepare Your VPS

Follow the **[VPS_SETUP.md](./VPS_SETUP.md)** guide to:

1. Install Docker and Docker Compose
2. Clone the repository to `/opt/rising-force-offline`
3. Configure environment variables in `.env`
4. Set up firewall rules
5. Perform initial deployment

**Estimated time:** 30-45 minutes for first-time setup

### Step 2: Configure GitHub Secrets

Add these three secrets to your GitHub repository:

1. Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

2. Add:
   - **`VPS_HOST`**: Your VPS hostname or IP address (e.g., `123.45.67.89` or `vps.example.com`)
   - **`VPS_USERNAME`**: Your SSH username (e.g., `deployer` or `root`)
   - **`VPS_PASSWORD`**: Your SSH password

**Security Note:** For production, consider using SSH keys instead (see VPS_SETUP.md for instructions).

### Step 3: Test the Deployment

Once your VPS is set up and GitHub secrets are configured:

1. Push a commit to the `main` branch or merge a pull request
2. Go to `Actions` tab in your GitHub repository
3. Watch the "Deploy to VPS" workflow run
4. Verify your application is accessible at your domain

## How the Deployment Works

```
┌─────────────────────────────────────────────────────────────┐
│  Developer pushes to main branch                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions triggers "Deploy to VPS" workflow           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Workflow connects to VPS via SSH                           │
│  (using VPS_HOST, VPS_USERNAME, VPS_PASSWORD from secrets)  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  On VPS:                                                     │
│  1. Navigate to /opt/rising-force-offline                   │
│  2. Pull latest code from main branch                       │
│  3. Stop running containers                                 │
│  4. Rebuild Docker images                                   │
│  5. Start containers with new code                          │
│  6. Clean up unused resources                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Application is live with latest changes!                   │
│  Users can access via https://yourdomain.com                │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Variables

### Required GitHub Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | Your VPS hostname or IP address | `123.45.67.89` or `vps.example.com` |
| `VPS_USERNAME` | SSH username | `deployer` |
| `VPS_PASSWORD` | SSH password | `your-secure-password` |

### Environment Variables on VPS (`.env` file)

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain name | `yourdomain.com` |
| `ACME_EMAIL` | Email for SSL certificates | `admin@yourdomain.com` |
| `TRAEFIK_AUTH` | Dashboard auth (optional) | `admin:$apr1$...` |

## Deployment Checklist

Before your first automated deployment:

- [ ] VPS is set up with Docker and Docker Compose installed
- [ ] Repository is cloned to `/opt/rising-force-offline` on VPS
- [ ] `.env` file is configured with your domain and email
- [ ] Firewall allows ports 80, 443, and 22
- [ ] DNS points your domain to VPS IP address
- [ ] GitHub secrets are configured (VPS_HOST, VPS_USERNAME, VPS_PASSWORD)
- [ ] Initial manual deployment successful (`docker compose up -d`)
- [ ] Application accessible at your domain

Once complete, every push to `main` will automatically deploy! 🚀

## Troubleshooting

### Deployment fails with "Permission denied"

**Solution:** Ensure the user specified in `VPS_USERNAME` has:
- Docker group membership: `sudo usermod -aG docker $USER`
- Write access to `/opt/rising-force-offline`

### Can't connect to VPS

**Solution:**
1. Verify SSH is running: `sudo systemctl status ssh`
2. Test connection manually: `ssh VPS_USERNAME@VPS_HOST`
3. Check firewall allows port 22: `sudo ufw status`

### Application not updating after deployment

**Solution:**
- Check GitHub Actions logs for errors
- Verify git pull succeeds on VPS
- Try manual rebuild: `docker compose down && docker compose up -d --build`

For more troubleshooting, see **[VPS_SETUP.md](./VPS_SETUP.md#troubleshooting)**.

## Next Steps

After successful deployment:

1. **Set up monitoring:** Monitor your application and Docker containers
2. **Enable automatic updates:** Configure unattended-upgrades for security
3. **Set up backups:** Backup `.env` and SSL certificates regularly
4. **Use SSH keys:** Replace password authentication with SSH keys (recommended)
5. **Configure domain:** Set up your custom domain and SSL certificates

## Additional Resources

- [VPS Setup Guide](./VPS_SETUP.md) - Complete setup instructions
- [Docker Setup Guide](./DOCKER.md) - Docker configuration details
- [Quick Start Guide](./QUICKSTART.md) - Quick deployment reference

---

**Questions or Issues?** Check the [GitHub Issues](https://github.com/mardin101/rising-force-offline/issues) or create a new one.
