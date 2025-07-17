# ==============================
#!/bin/bash

PROJECT_ID="your-project-id"
REGION="asia-south1"
SERVICE_NAME="smart-scheduler-backend"

# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_gemini_key,OPENAI_API_KEY=your_openai_key"

# Open Cloud Run URL
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
