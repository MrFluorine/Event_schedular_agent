# =========================
# Stage 1: Build the Vite app
# =========================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy source files
COPY . .

# Install dependencies and build
RUN npm install \
    && npm install --save-dev terser \
    && npm run build

# =========================
# Stage 2: Serve with Nginx
# =========================
FROM nginx:alpine

# Copy built app to Nginx's public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Remove default nginx config and use custom one (recommended for SPAs)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 instead of 80 (Cloud Run expects 8080)
EXPOSE 8080

# Set environment variable so nginx knows which port to use (for Cloud Run)
ENV PORT=8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]