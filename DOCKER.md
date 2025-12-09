# Docker Setup for Rising Force Offline

This guide explains how to run the Rising Force Offline application using Docker with Traefik for HTTPS support.

## Prerequisites

- Docker Engine (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- A domain name (for production HTTPS setup)

## Quick Start (Local Development)

For local testing without HTTPS:

```bash
# Build and start the application
docker-compose up -d

# Access the application
# Open http://localhost in your browser
```

## Production Setup with HTTPS

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
DOMAIN=yourdomain.com
ACME_EMAIL=your-email@example.com
```

### 2. DNS Configuration

Point your domain to your server's IP address:

```
A record: yourdomain.com -> YOUR_SERVER_IP
```

For Traefik dashboard (optional):
```
A record: traefik.yourdomain.com -> YOUR_SERVER_IP
```

### 3. Start the Services

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Your Application

- **Application**: https://yourdomain.com
- **Traefik Dashboard**: https://traefik.yourdomain.com (if configured)

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DOMAIN` | Your domain name | `localhost` | Yes (for HTTPS) |
| `ACME_EMAIL` | Email for Let's Encrypt | `admin@example.com` | Yes (for HTTPS) |
| `TRAEFIK_AUTH` | Basic auth for Traefik dashboard | Not set | No |

### Traefik Dashboard Authentication

The Traefik dashboard port (8080) is commented out by default for security. To access the dashboard:

**Option 1: Via Domain (Recommended)**
Access via https://traefik.yourdomain.com with proper authentication.

1. Generate a password hash:
```bash
# Install htpasswd if not available
# Ubuntu/Debian: apt-get install apache2-utils
# macOS: brew install httpd

# Generate hash (replace 'yourpassword' with your actual password)
htpasswd -nb admin yourpassword
```

2. Add to `.env` file:
```env
TRAEFIK_AUTH=admin:$apr1$...your-hash...
```

3. Uncomment the auth middleware lines in `docker-compose.yml`:
```yaml
- "traefik.http.routers.dashboard.middlewares=auth"
- "traefik.http.middlewares.auth.basicauth.users=${TRAEFIK_AUTH}"
```

**Option 2: Direct Port Access (Development Only)**
For local development, you can uncomment the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8080:8080"  # Uncomment for local development
```
Then access via http://localhost:8080/dashboard/

**⚠️ Security Warning**: Never expose port 8080 in production without authentication!

## Docker Commands

### Using Makefile (Recommended)

A Makefile is provided for convenience:

```bash
# Show all available commands
make help

# Build Docker images
make build

# Start all services
make up

# Stop all services
make down

# View logs
make logs

# Rebuild everything
make rebuild

# Validate configuration
make validate
```

### Basic Operations

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f rising-force-app

# Rebuild after code changes
docker compose up -d --build
```

### Maintenance

```bash
# Remove all containers and networks
docker-compose down

# Remove all data including volumes
docker-compose down -v

# Clean up Docker system
docker system prune -a
```

## SSL Certificates

### Let's Encrypt

Traefik automatically obtains SSL certificates from Let's Encrypt using the TLS challenge. Certificates are stored in `./letsencrypt/acme.json`.

**Important**: 
- Keep `acme.json` secure and backed up
- Let's Encrypt has rate limits (50 certificates per domain per week)
- Use staging environment for testing by adding to Traefik command:
  ```yaml
  - "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
  ```

### Certificate Renewal

Traefik automatically renews certificates before they expire. No manual intervention needed.

## Architecture

```
┌─────────────────┐
│   Internet      │
└────────┬────────┘
         │
    Port 80/443
         │
┌────────▼────────────────┐
│   Traefik Proxy         │
│  - SSL Termination      │
│  - HTTP → HTTPS         │
│  - Let's Encrypt        │
└────────┬────────────────┘
         │
    Port 80 (internal)
         │
┌────────▼────────────────┐
│  Rising Force App       │
│  - Nginx + Static Files │
└─────────────────────────┘
```

## Troubleshooting

### Application not accessible

1. Check if containers are running:
```bash
docker-compose ps
```

2. Check logs for errors:
```bash
docker-compose logs traefik
docker-compose logs rising-force-app
```

3. Verify DNS is pointing to your server:
```bash
nslookup yourdomain.com
```

### SSL Certificate Issues

1. Check Traefik logs:
```bash
docker-compose logs traefik | grep -i acme
```

2. Verify ports 80 and 443 are accessible from internet

3. Check Let's Encrypt rate limits at: https://letsencrypt.org/docs/rate-limits/

4. For testing, use Let's Encrypt staging:
   - Edit docker-compose.yml
   - Add staging CA server to Traefik command
   - Remove `./letsencrypt` directory
   - Restart services

### Port Already in Use

If ports 80 or 443 are already in use:

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop the conflicting service or change Traefik ports in docker-compose.yml
```

## Security Best Practices

1. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **Use strong passwords** for Traefik dashboard

3. **Restrict Traefik dashboard access** by IP or remove it entirely in production

4. **Regular backups** of `./letsencrypt/acme.json`

5. **Monitor logs** for suspicious activity:
   ```bash
   docker-compose logs -f | grep -i error
   ```

6. **Firewall configuration**:
   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

## Local Development Without HTTPS

For local development, you can run without HTTPS:

1. Comment out the HTTPS redirect in `docker-compose.yml`:
   ```yaml
   # - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
   # - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
   ```

2. Use HTTP entrypoint for the app:
   ```yaml
   - "traefik.http.routers.rising-force.entrypoints=web"
   ```

3. Access via http://localhost

## Additional Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
