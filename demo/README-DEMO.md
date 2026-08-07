# SMARTER Demo

This folder contains the Docker Compose configuration and resources required to run a local demonstration of the SMARTER platform. This demo starts the frontend, backend, and PostgreSQL database as local Docker containers.

## Prerequisites
- Docker
- Docker Compose



## Quick start

```bash
# From repository root
./run-demo.sh
```

### What it does
- Builds the backend image from `../backend/Dockerfile` and exposes port `8081`.
- Builds the frontend image from `../frontend/Dockerfile` and exposes port `43080`.
- Starts a Postgres database from `bigunibo/postgresql:1.0.0` on port `5433`.
- Restores the demo database from the dump in `./init-db` during the first startup.

## Demo Dataset

The demo database contains a representative subset of the SMARTER dataset and is intended to showcase the platform's main functionalities.

The dataset includes:

- Data from **two agricultural companies**.
- Historical measurements collected between **1 May 2025** and **30 October 2025**.
- Soil sensor measurements, weather observations, irrigation events, and the corresponding metadata required by the platform.

The dataset has been reduced in size and is intended for demonstration purposes only. It does not represent the complete production database.

### Demo User Credentials

| User | Password |
|------|----------|
| `abds@unibo.it` | `password` |
| `abds-demo@unibo.it` | `password` |

## Services

| Service | Address |
|---------|---------|
| Frontend | http://localhost:43080 |
| Backend API | http://localhost:8081 |
| PostgreSQL | localhost:5433 |

## Default database credentials

| Parameter | Value |
|-----------|-------|
| Database | `smarter_demo` |
| User | `postgres` |
| Password | `password` |
| Host (inside Docker) | `postgres` |
| Host (from host machine) | `localhost` |
| Port (inside Docker) | `5432` |
| Port (from host machine) | `5433` |

## Notes

The PostgreSQL database is initialized only when the data volume is created for the first time. If the volume already exists, the initialization scripts in `./init-db` are skipped.

To recreate the demo database from scratch:

```bash
docker compose down -v
docker compose up --build
```