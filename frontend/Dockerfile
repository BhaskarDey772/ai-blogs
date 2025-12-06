FROM node:18-alpine AS build
WORKDIR /app

# Accept build-time variable
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY tsconfig.json tsconfig.node.json index.html vite.config.ts ./
COPY src ./src

# Build with correct API URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
