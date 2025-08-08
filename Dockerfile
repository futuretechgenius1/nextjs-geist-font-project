# Multi-stage Dockerfile for frontend and backend

# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Build backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend .

# Final stage
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy frontend build output
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/package.json ./package.json
COPY --from=frontend-build /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start backend and frontend concurrently
CMD ["sh", "-c", "node backend/server.js & next start -p 3000"]
