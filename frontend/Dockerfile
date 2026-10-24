# syntax=docker/dockerfile:1
# dev | prod  — selected at the very bottom via `FROM ${RUN_MODE}`
ARG RUN_MODE=dev

# ===== Dev Mode =====
# node_modules is installed inside the image and preserved as an anonymous
# volume in docker-compose, so the bind-mounted host code never shadows it.
FROM node:22 AS dev
WORKDIR /app
ADD . /app
RUN npm install
RUN ["chmod", "+x", "/app/scripts/startup-dev.sh"]
ENTRYPOINT ["/bin/bash", "/app/scripts/startup-dev.sh"]

# ===== Prod Mode =====
FROM node:22-slim AS prod
# `vite build` bakes VITE_* into the bundle, so they must exist at build time
# (passed as build args from docker-compose.yml).
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
WORKDIR /app
ADD . /app
RUN npm install && npm run build
RUN ["chmod", "+x", "/app/scripts/startup-prod.sh"]
ENTRYPOINT ["/bin/bash", "/app/scripts/startup-prod.sh"]

# Pick the container from the selected run mode
FROM ${RUN_MODE}
