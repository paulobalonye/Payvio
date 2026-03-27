#!/bin/bash
# ============================================================
# Payvio — Azure Infrastructure Setup
# Run once to create all Azure resources
# Prerequisites: az cli logged in (az login)
# ============================================================

set -euo pipefail

# --- Config ---
RESOURCE_GROUP="payvio-rg"
LOCATION="eastus"
ACR_NAME="payvio"
CONTAINER_APP_ENV="payvio-env"
CONTAINER_APP_NAME="payvio-api"
POSTGRES_SERVER="payvio-db"
POSTGRES_ADMIN_USER="payvio_admin"
REDIS_NAME="payvio-cache"

echo "=== Creating Resource Group ==="
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "=== Creating Azure Container Registry ==="
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

echo "=== Creating Azure Database for PostgreSQL ==="
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user $POSTGRES_ADMIN_USER \
  --admin-password "$(openssl rand -base64 32)" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --yes

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name payvio

echo "=== Creating Azure Cache for Redis ==="
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0

echo "=== Creating Container Apps Environment ==="
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

echo "=== Creating Container App ==="
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image "$ACR_NAME.azurecr.io/payvio-api:latest" \
  --registry-server "$ACR_NAME.azurecr.io" \
  --target-port 4000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Get ACR credentials:  az acr credential show --name $ACR_NAME"
echo "2. Get PostgreSQL connection string from Azure Portal"
echo "3. Get Redis connection string:  az redis list-keys --name $REDIS_NAME --resource-group $RESOURCE_GROUP"
echo "4. Add these as GitHub secrets:"
echo "   - AZURE_CREDENTIALS (service principal JSON)"
echo "   - ACR_USERNAME"
echo "   - ACR_PASSWORD"
echo "   - APP_URL (container app URL)"
echo "5. Configure container app env vars:"
echo "   az containerapp update --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --set-env-vars \\"
echo "     DATABASE_URL=<postgres-connection-string> \\"
echo "     REDIS_URL=<redis-connection-string> \\"
echo "     JWT_SECRET=<random-64-char-string> \\"
echo "     ..."
