#!/bin/bash
# ============================================================
# Payvio — Azure VM + Docker Deployment
# Creates VM, installs Docker, deploys all services
#
# Usage: ./azure-vm-deploy.sh
# Prerequisites: az cli logged in (az login)
# ============================================================

set -euo pipefail

# --- Config ---
RESOURCE_GROUP="payvio-rg"
LOCATION="eastus"
VM_NAME="payvio-vm"
VM_SIZE="Standard_B2s"    # 2 vCPU, 4GB RAM — ~$30/mo
VM_IMAGE="Ubuntu2404"
ADMIN_USER="payvio"
REPO_URL="https://github.com/paulobalonye/Payvio.git"
DOMAIN="${DOMAIN:-payvioapp.com}"

echo "============================================"
echo "  Payvio — Azure VM Deployment"
echo "============================================"
echo ""
echo "  VM Size:   $VM_SIZE (2 vCPU, 4GB RAM)"
echo "  Location:  $LOCATION"
echo "  Domain:    $DOMAIN"
echo ""

# === Step 1: Resource Group ===
echo ">>> Step 1/7: Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
echo "    ✓ Resource group: $RESOURCE_GROUP"

# === Step 2: Create VM ===
echo ">>> Step 2/7: Creating VM (this takes ~2 minutes)..."
VM_IP=$(az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image $VM_IMAGE \
  --size $VM_SIZE \
  --admin-username $ADMIN_USER \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --output tsv \
  --query publicIpAddress)

echo "    ✓ VM created: $VM_NAME"
echo "    ✓ Public IP: $VM_IP"

# === Step 3: Open ports ===
echo ">>> Step 3/7: Opening ports (80, 443, 22)..."
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 80 --priority 1001 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 443 --priority 1002 --output none
echo "    ✓ Ports 80, 443 opened"

# === Step 4: Install Docker on VM ===
echo ">>> Step 4/7: Installing Docker on VM..."
az vm run-command invoke \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --command-id RunShellScript \
  --scripts '
    # Install Docker
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker payvio
    systemctl enable docker
    systemctl start docker

    # Install Docker Compose plugin
    apt-get update -qq && apt-get install -y -qq docker-compose-plugin git

    echo "Docker installed: $(docker --version)"
  ' --output none

echo "    ✓ Docker installed"

# === Step 5: Clone repo and set up ===
echo ">>> Step 5/7: Cloning repo and setting up..."
az vm run-command invoke \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --command-id RunShellScript \
  --scripts "
    cd /home/payvio
    git clone $REPO_URL app
    chown -R payvio:payvio app
    cd app/deploy
    cp .env.example .env
    echo 'Repo cloned to /home/payvio/app'
  " --output none

echo "    ✓ Repo cloned"

# === Step 6: Generate secrets ===
echo ">>> Step 6/7: Generating production secrets..."
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
REDIS_PASS=$(openssl rand -base64 24 | tr -d '/+=')
JWT_SEC=$(openssl rand -base64 48 | tr -d '/+=')

az vm run-command invoke \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --command-id RunShellScript \
  --scripts "
    cd /home/payvio/app/deploy
    sed -i 's|CHANGE_ME_STRONG_PASSWORD_HERE|$DB_PASS|g' .env
    sed -i 's|CHANGE_ME_REDIS_PASSWORD|$REDIS_PASS|g' .env
    sed -i 's|CHANGE_ME_64_CHAR_RANDOM_STRING|$JWT_SEC|g' .env
    sed -i 's|DOMAIN=payvioapp.com|DOMAIN=$DOMAIN|g' .env
    echo 'Secrets generated'
  " --output none

echo "    ✓ Secrets generated"

# === Step 7: Build and start ===
echo ">>> Step 7/7: Building and starting services (this takes ~5 minutes)..."
az vm run-command invoke \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --command-id RunShellScript \
  --scripts '
    cd /home/payvio/app/deploy
    docker compose -f docker-compose.prod.yml up -d --build 2>&1 | tail -20
    sleep 10
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  ' --output table

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  VM IP:      $VM_IP"
echo "  SSH:        ssh payvio@$VM_IP"
echo ""
echo "  Next steps:"
echo "  1. SSH into VM: ssh payvio@$VM_IP"
echo "  2. Edit API keys: nano ~/app/deploy/.env"
echo "     Add your Stripe, YellowCard, Veriff, Flutterwave,"
echo "     Plivo, and Resend keys"
echo "  3. Restart: cd ~/app/deploy && docker compose -f docker-compose.prod.yml up -d"
echo "  4. Run DB migration: docker exec payvio-api npx prisma migrate deploy"
echo ""
echo "  DNS Records (point to $VM_IP):"
echo "  A    payvio.com        → $VM_IP"
echo "  A    api.payvio.com    → $VM_IP"
echo "  A    admin.payvio.com  → $VM_IP"
echo ""
echo "  Once DNS is set, Caddy auto-provisions SSL certificates."
echo ""
echo "  Health check: curl http://$VM_IP:4000/health"
echo ""
echo "  Cost: ~\$30/month (Standard_B2s)"
echo "============================================"
