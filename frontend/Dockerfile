### Build stage
FROM public.ecr.aws/docker/library/node:18-alpine AS build

WORKDIR /app

# required for build-time API base (not used at runtime)
ARG VITE_API_BASE
ARG VITE_CLERK_PUBLISHABLE_KEY

ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY . .
RUN npm run build

### Serve stage
FROM public.ecr.aws/nginx/nginx:stable-alpine
RUN apk add --no-cache gettext bash

WORKDIR /usr/share/nginx/html

# Copy dist from build
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint + allow execution
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# RUN AT STARTUP ALWAYS
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80