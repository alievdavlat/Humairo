#!/bin/bash
# Frontend container startup (dev). Runs inside the container as ENTRYPOINT.
cd /app/
npm run dev -- --host 0.0.0.0
