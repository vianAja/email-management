# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production serve
FROM node:24-alpine AS production

WORKDIR /app

# We need package.json and packages to run express backend
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js .

ENV PORT=9000
EXPOSE 9000

CMD ["node", "server.js"]
