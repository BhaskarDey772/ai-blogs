### Build stage
FROM public.ecr.aws/docker/library/node:18-alpine AS build

WORKDIR /app

ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

### Serve stage
FROM public.ecr.aws/nginx/nginx:stable-alpine
RUN apk add --no-cache gettext bash

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]



