### Build stage
FROM public.ecr.aws/docker/library/node:18-alpine AS build

WORKDIR /app

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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Copy entrypoint to ROOT folder
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# VERY IMPORTANT — Add CMD so entrypoint isn't overridden
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
