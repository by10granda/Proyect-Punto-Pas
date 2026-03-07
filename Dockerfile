# Multi-stage Dockerfile for building and serving the Vite React app
# Stage 1: build static assets
FROM node:18-slim AS builder
WORKDIR /app

# copy package files first to take advantage of layer caching
COPY package.json package-lock.json ./

# install dependencies
RUN npm ci --production=false

# copy source and build
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine

# Remove default nginx html (if any) and copy built assets
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
