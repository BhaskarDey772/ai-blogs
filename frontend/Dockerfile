### Build stage
FROM public.ecr.aws/docker/library/node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Copy full source
COPY . .

# Build Vite output
RUN npm run build


### Serve stage
FROM public.ecr.aws/nginx/nginx:stable-alpine

RUN apk add --no-cache gettext bash

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the ENV TEMPLATE for runtime injection
COPY public/env-config.template.js /usr/share/nginx/html/env-config.template.js

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
