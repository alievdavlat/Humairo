#!/bin/bash
# Frontend container startup (prod). Runs inside the container as ENTRYPOINT.
cd /app/
npm run preview -- --host 0.0.0.0 --port 5173
