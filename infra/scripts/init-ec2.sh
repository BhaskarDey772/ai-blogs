#!/bin/bash

# Initialize EC2 instance for Tech Test application

set -e

echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

echo "Installing Docker..."
sudo apt-get install -y docker.io

echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

echo "Pulling latest images..."
cd /home/ubuntu/ai-blogs
docker-compose pull

echo "Starting services..."
docker-compose up -d

echo "EC2 initialization complete!"
