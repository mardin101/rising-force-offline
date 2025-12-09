# Makefile for Rising Force Offline Docker Operations

.PHONY: help build up down restart logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker compose build

up: ## Start all services in detached mode
	docker compose up -d

down: ## Stop and remove all containers
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

logs-app: ## View logs from the app service only
	docker compose logs -f rising-force-app

logs-traefik: ## View logs from Traefik service only
	docker compose logs -f traefik

status: ## Show status of all services
	docker compose ps

clean: ## Remove containers, networks, and volumes
	docker compose down -v

rebuild: ## Rebuild and restart all services
	docker compose down
	docker compose build --no-cache
	docker compose up -d

shell-app: ## Open shell in the app container
	docker compose exec rising-force-app sh

test-build: ## Test build the Docker image
	docker build -t rising-force-offline:test .

validate: ## Validate docker-compose.yml
	docker compose config --quiet && echo "docker-compose.yml is valid"
