# VPS Setup Guide for Rising Force Offline

This guide provides step-by-step instructions to prepare your VPS for automated Docker deployments from GitHub Actions.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial VPS Setup](#initial-vps-setup)
- [Install Docker](#install-docker)
- [Install Docker Compose](#install-docker-compose)
- [Setup Application Directory](#setup-application-directory)
- [Configure Environment Variables](#configure-environment-variables)
- [Configure GitHub Secrets](#configure-github-secrets)
- [Firewall Configuration](#firewall-configuration)
- [Initial Deployment](#initial-deployment)
- [Verify Deployment](#verify-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **VPS Requirements:**
  - Ubuntu 20.04 LTS or later (or Debian 10+)
  - Minimum 2GB RAM
  - Minimum 20GB disk space
  - Root or sudo access
  - Public IP address

- **Local Requirements:**
  - GitHub account with admin access to the repository
  - Domain name (optional but recommended for HTTPS)

## Initial VPS Setup

### 1. Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
# or
ssh YOUR_USERNAME@YOUR_VPS_IP
```

### 2. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Create Application User (Optional but Recommended)

If you're logged in as root, create a dedicated user for the application:

```bash
# Create user
sudo adduser deployer

# Add user to sudo group
sudo usermod -aG sudo deployer

# Switch to the new user
su - deployer
```

## Install Docker

### Method 1: Using Official Docker Script (Recommended)

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify Docker installation
docker --version
```

### Method 2: Manual Installation (Ubuntu/Debian)

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt update
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### Enable Docker to Start on Boot

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## Install Docker Compose

Docker Compose v2 is included with Docker Engine. Verify installation:

```bash
docker compose version
```

If you need to install Docker Compose v2 separately:

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

## Setup Application Directory

### 1. Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /opt/rising-force-offline

# Change ownership to your user
sudo chown -R $USER:$USER /opt/rising-force-offline

# Navigate to the directory
cd /opt/rising-force-offline
```

### 2. Clone the Repository

```bash
# Install git if not already installed
sudo apt install -y git

# Clone the repository
git clone https://github.com/mardin101/rising-force-offline.git .

# Verify files
ls -la
```

### 3. Set Up Git for Automated Pulls

```bash
# Configure git to use the main branch
git checkout main

# Optional: Set up git credentials if repository is private
git config --global credential.helper store
```

## Configure Environment Variables

### 1. Create Environment File

```bash
# Navigate to application directory
cd /opt/rising-force-offline

# Copy example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

### 2. Configure .env File

Update the following values in `.env`:

```env
# Your domain name (replace with your actual domain)
DOMAIN=yourdomain.com

# Email for Let's Encrypt SSL certificates
ACME_EMAIL=your-email@example.com

# Optional: Basic auth for Traefik dashboard
# Generate with: htpasswd -nb admin yourpassword
# TRAEFIK_AUTH=admin:$apr1$...
```

### 3. Generate Traefik Dashboard Password (Optional)

```bash
# Install apache2-utils for htpasswd
sudo apt install -y apache2-utils

# Generate password hash
htpasswd -nb admin yourpassword

# Add the output to .env file under TRAEFIK_AUTH
```

## Configure GitHub Secrets

GitHub Actions needs access to your VPS. Configure the following secrets in your GitHub repository:

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings**
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2. Add Required Secrets

Add the following three secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_IP` | Your VPS IP address | Example: `123.45.67.89` |
| `VPS_USERNAME` | SSH username | Example: `deployer` or `root` |
| `VPS_PASSWORD` | SSH password | Your VPS user password |

**Security Note:** For production environments, consider using SSH keys instead of passwords. See [Advanced Security](#advanced-security-ssh-keys) section.

### 3. Verify Secrets

After adding secrets, you should see them listed (values will be hidden).

## Firewall Configuration

### Using UFW (Uncomplicated Firewall)

```bash
# Install UFW if not installed
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first to avoid locking yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

### Verify Ports are Open

```bash
# Check if ports are listening
sudo ss -tulpn | grep -E ':(80|443|22)'
```

## Initial Deployment

### 1. Test Docker Compose Configuration

```bash
cd /opt/rising-force-offline

# Validate docker-compose.yml
docker compose config

# Build images
docker compose build
```

### 2. Start Services Manually (First Time)

```bash
# Start all services
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f
```

### 3. Verify Application is Running

```bash
# Check if containers are running
docker ps

# Test local access
curl -I http://localhost

# Check Traefik logs for SSL certificate acquisition
docker compose logs traefik | grep -i acme
```

## Verify Deployment

### 1. DNS Configuration

Ensure your domain points to your VPS:

```bash
# Check DNS resolution
nslookup yourdomain.com

# Should return your VPS IP address
```

### 2. Test Application Access

- **Via Browser:**
  - Navigate to `https://yourdomain.com`
  - Verify SSL certificate is valid

- **Via Command Line:**
  ```bash
  curl -I https://yourdomain.com
  ```

### 3. Monitor Deployment

```bash
# View all container logs
docker compose logs -f

# View specific container logs
docker compose logs -f rising-force-app
docker compose logs -f traefik

# Check container resource usage
docker stats
```

## Troubleshooting

### Issue: "Permission denied" when running Docker commands

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

### Issue: Port 80 or 443 already in use

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop the conflicting service
sudo systemctl stop apache2  # Example for Apache
sudo systemctl stop nginx    # Example for Nginx

# Disable from starting on boot
sudo systemctl disable apache2
```

### Issue: SSL Certificate not working

**Solution:**
```bash
# Check Traefik logs
docker compose logs traefik | grep -i error

# Verify DNS is correctly pointing to your server
nslookup yourdomain.com

# Ensure ports 80 and 443 are accessible from internet
sudo ufw status

# Check if Let's Encrypt rate limit was hit
# Wait 1 hour and try again, or use staging environment for testing
```

### Issue: Containers failing to start

**Solution:**
```bash
# Check container logs
docker compose logs

# Check Docker daemon status
sudo systemctl status docker

# Restart Docker daemon
sudo systemctl restart docker

# Rebuild containers
docker compose down
docker compose up -d --build
```

### Issue: GitHub Actions deployment fails

**Solution:**

1. **Verify GitHub Secrets:**
   - Check that VPS_IP, VPS_USERNAME, and VPS_PASSWORD are correctly set

2. **Test SSH connection manually:**
   ```bash
   ssh VPS_USERNAME@VPS_IP
   ```

3. **Check SSH is running on VPS:**
   ```bash
   sudo systemctl status ssh
   sudo systemctl start ssh
   ```

4. **Verify git repository permissions:**
   ```bash
   cd /opt/rising-force-offline
   ls -la
   # Ensure your user has write permissions
   ```

5. **Check GitHub Actions workflow logs:**
   - Go to repository → Actions tab
   - Click on the failed workflow
   - Review error messages

### Issue: Out of disk space

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker resources
docker system prune -a -f

# Remove old images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f
```

### Issue: Application not updating after deployment

**Solution:**
```bash
# Force rebuild without cache
cd /opt/rising-force-offline
docker compose down
docker compose build --no-cache
docker compose up -d

# Or use Make command if available
make rebuild
```

## Advanced Configuration

### SSH Keys (Recommended for Production)

Instead of using password authentication, use SSH keys for better security:

#### 1. Generate SSH Key on GitHub Actions Runner

This is handled automatically by using `webfactory/ssh-agent` action. Update your workflow:

```yaml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.9.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

- name: Deploy to VPS
  run: |
    ssh -o StrictHostKeyChecking=no ${{ secrets.VPS_USERNAME }}@${{ secrets.VPS_IP }} << 'EOF'
      cd /opt/rising-force-offline
      git pull origin main
      docker compose down
      docker compose build --no-cache
      docker compose up -d
      docker system prune -f
    EOF
```

#### 2. Generate and Add SSH Key to VPS

```bash
# On your local machine, generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/github_actions_key.pub VPS_USERNAME@VPS_IP

# Add the private key to GitHub Secrets as SSH_PRIVATE_KEY
cat ~/.ssh/github_actions_key
# Copy the entire output and add as GitHub secret
```

### Monitoring and Logging

#### Setup Log Rotation

```bash
# Create docker log rotation config
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

#### Monitor with Docker Stats

```bash
# Real-time container resource usage
docker stats

# Save to file
docker stats --no-stream > /var/log/docker-stats.log
```

### Automatic Updates

Consider setting up automatic security updates:

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Maintenance Tasks

### Regular Maintenance Checklist

- **Weekly:**
  - Check disk space: `df -h`
  - Review logs: `docker compose logs --tail=100`
  - Clean up Docker: `docker system prune -f`

- **Monthly:**
  - Update system packages: `sudo apt update && sudo apt upgrade -y`
  - Backup `.env` and `letsencrypt/` directory
  - Review firewall rules: `sudo ufw status`

- **Quarterly:**
  - Review and rotate logs
  - Update Docker: `sudo apt install docker-ce docker-ce-cli containerd.io`
  - Security audit

### Backup Important Files

```bash
# Create backup directory
mkdir -p ~/backups

# Backup environment and SSL certificates
cd /opt/rising-force-offline
tar -czf ~/backups/rising-force-backup-$(date +%Y%m%d).tar.gz .env letsencrypt/

# List backups
ls -lh ~/backups/
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/mardin101/rising-force-offline/issues)
2. Review Docker logs: `docker compose logs`
3. Create a new issue with detailed error messages and steps to reproduce

---

**Note:** Always keep your VPS credentials secure and never commit them to version control.
