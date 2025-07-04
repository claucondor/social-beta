#!/bin/bash

# Deployment script for La Red de Autómatas Backend
set -e

# --- Robustness: Change to the script's own directory ---
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"
# ----------------------------------------------------

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 La Red de Autómatas - Backend Deployment${NC}"
echo "================================================"

    # Check if Project ID is provided as an argument
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Error: No GCP Project ID provided as an argument.${NC}"
        echo "Usage: ./deploy.sh YOUR_GCP_PROJECT_ID"
        exit 1
    fi
    GCP_PROJECT_ID=$1

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  No active gcloud authentication found${NC}"
    echo "Authenticating with gcloud..."
    gcloud auth login
fi

# Set the project
echo -e "${BLUE}📦 Setting GCP project to ${GCP_PROJECT_ID}${NC}"
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required GCP APIs${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# Build and deploy
echo -e "${BLUE}🏗️  Building and deploying with Cloud Build${NC}"
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe la-red-de-automatas-backend --region=us-central1 --format="value(status.url)")

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "================================================"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}❤️  Health Check: ${SERVICE_URL}/health${NC}"
echo -e "${GREEN}📚 API Docs: ${SERVICE_URL}/api/docs${NC}"
echo ""

# Optional: Set up Cloud Scheduler jobs
read -p "Do you want to set up Cloud Scheduler jobs for message processing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}⏰ Setting up Cloud Scheduler jobs${NC}"
    
    # Enable Cloud Scheduler API
    gcloud services enable cloudscheduler.googleapis.com
    
    # Create App Engine app if it doesn't exist (required for Cloud Scheduler)
    if ! gcloud app describe &> /dev/null; then
        echo -e "${YELLOW}📱 Creating App Engine app (required for Cloud Scheduler)${NC}"
        gcloud app create --region=us-central
    fi
    
    # Create message queue processing job
    gcloud scheduler jobs create http process-message-queue \
        --schedule="* * * * *" \
        --uri="${SERVICE_URL}/api/scheduler/process-queue" \
        --http-method=POST \
        --headers="Content-Type=application/json" \
        --location=us-central1 \
        --quiet || echo "Job might already exist"
    
    # Create daily maintenance job
    gcloud scheduler jobs create http daily-maintenance \
        --schedule="0 2 * * *" \
        --uri="${SERVICE_URL}/api/scheduler/maintenance" \
        --http-method=POST \
        --headers="Content-Type=application/json" \
        --location=us-central1 \
        --quiet || echo "Job might already exist"
    
    echo -e "${GREEN}✅ Cloud Scheduler jobs created${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All done! Your backend is ready to serve La Resistencia.${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "1. Update your frontend configuration with the service URL"
echo "2. Configure your Flow blockchain oracle address and private key"
echo "3. Set up your Cloud Storage bucket for assets"
echo "4. Test the endpoints using the API documentation" 