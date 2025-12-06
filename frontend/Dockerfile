### Build stage
FROM public.ecr.aws/docker/library/node:18-alpine AS build

WORKDIR /app

# Accept Vite environment variable
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY . .

# Build production frontend
RUN npm run build

### Serve stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

