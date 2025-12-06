FROM public.ecr.aws/docker/library/node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY tsconfig.json tsconfig.node.json index.html vite.config.ts ./
COPY src ./src

RUN npm run build

# Serve using nginx from AWS public ECR
FROM public.ecr.aws/nginx/nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
