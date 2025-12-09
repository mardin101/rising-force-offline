# Quick Start Guide - Docker Deployment

This is a quick reference for deploying Rising Force Offline with Docker and HTTPS.

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- A domain name pointing to your server

## 5-Minute Setup

### 1. Clone and Configure
```bash
git clone https://github.com/mardin101/rising-force-offline.git
cd rising-force-offline
cp .env.example .env
```

### 2. Edit Configuration
Edit `.env` with your domain and email:
```env
DOMAIN=yourdomain.com
ACME_EMAIL=your-email@example.com
```

### 3. Deploy
```bash
make up
# or
docker compose up -d
```

### 4. Access Your Application
- Application: https://yourdomain.com
- Traefik Dashboard: https://traefik.yourdomain.com (after configuring auth)

## Common Commands

| Task | Command |
|------|---------|
| Start services | `make up` |
| Stop services | `make down` |
| View logs | `make logs` |
| View app logs only | `make logs-app` |
| Rebuild after changes | `make rebuild` |
| Check status | `make status` |

## Troubleshooting

**Problem**: Can't access the application  
**Solution**: Check DNS points to server IP, verify ports 80/443 are open

**Problem**: SSL certificate errors  
**Solution**: Check logs with `make logs-traefik`, verify email in .env

**Problem**: Port already in use  
**Solution**: Check if another service uses ports 80/443: `sudo lsof -i :80`

## Local Development

For local testing without HTTPS:
```bash
# Just start the services
docker compose up -d

# Access via http://localhost
```

## Need More Help?

See the comprehensive [DOCKER.md](./DOCKER.md) guide for:
- Detailed configuration options
- Security best practices
- Advanced troubleshooting
- Architecture overview
- Production deployment tips
