#!/bin/bash

# Build and push Docker images to ECR

set -e

AWS_ACCOUNT_ID=$1
AWS_REGION="us-east-1"
ECR_REPO_PREFIX="tech-test"

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Usage: ./deploy.sh <AWS_ACCOUNT_ID>"
  exit 1
fi

echo "Building Docker images..."

# Build backend
docker build -t $ECR_REPO_PREFIX-backend:latest ./backend

# Build frontend
docker build -t $ECR_REPO_PREFIX-frontend:latest ./frontend

echo "Tagging images for ECR..."

# Tag backend
docker tag $ECR_REPO_PREFIX-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_PREFIX-backend:latest

# Tag frontend
docker tag $ECR_REPO_PREFIX-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_PREFIX-frontend:latest

echo "Pushing images to ECR..."

# Push backend
docker push $AWS_ACCOUNT_ID.dkr.ecis.us-east-1.amazonaws.com/$ECR_REPO_PREFIX-backend:latest

# Push frontend
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_PREFIX-frontend:latest

echo "Deployment complete!"
