# Use AWS public ECR mirror instead of Docker Hub
FROM public.ecr.aws/docker/library/node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM public.ecr.aws/docker/library/node:18-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production --silent || npm install --production --silent

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
