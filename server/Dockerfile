# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
ARG NPM_TOKEN
COPY package*.json .npmrc ./
RUN npm ci
RUN rm -f .npmrc
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ARG NPM_TOKEN
COPY package*.json .npmrc ./
RUN npm ci --omit=dev && rm -f .npmrc
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config
EXPOSE 5000
CMD ["node", "dist/server.js"]
