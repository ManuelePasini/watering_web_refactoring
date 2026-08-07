#!/usr/bin/env bash
set -euo pipefail

cp backend/application/.env.example backend/application/.env

cp frontend/SMARTER-frontend/.env.example frontend/SMARTER-frontend/.env

# Build images and run demo stack
docker compose -f demo/docker-compose.demo.yaml up --build
