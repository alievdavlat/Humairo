# dev | prod  — selected  via `FROM ${RUN_MODE}`
ARG RUN_MODE=dev

# ===== Dev Mode =====
FROM node:22 AS dev
WORKDIR /app
ADD . /app
RUN npm install
RUN ["chmod", "+x", "/app/run.sh"]
CMD ["/bin/bash", "run.sh"]

# ===== Prod Mode =====
FROM node:22-slim AS prod
WORKDIR /app
ADD . /app
RUN npm install && npm run build
ENV NODE_ENV=production
CMD ["npm", "run", "start"]

# Pick the container from the selected run mode
FROM ${RUN_MODE}
