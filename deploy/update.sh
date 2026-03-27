#!/bin/bash
# Run this ON the VM to pull latest code and redeploy
# Usage: ssh payvio@<VM_IP> "cd app/deploy && ./update.sh"

set -euo pipefail

echo ">>> Pulling latest code..."
cd /home/payvio/app
git pull origin main

echo ">>> Rebuilding containers..."
cd deploy
docker compose -f docker-compose.prod.yml up -d --build

echo ">>> Running DB migrations..."
docker exec payvio-api npx prisma migrate deploy 2>/dev/null || echo "Migration skipped (may need manual run)"

echo ">>> Health check..."
sleep 5
curl -s http://localhost:4000/health

echo ""
echo ">>> Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "Update complete!"
