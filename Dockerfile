# Use Node.js for building and serving the React app
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Environment variables will be injected by Cloud Run during build
# These should match the environment variable names you set in Cloud Run
ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_OAUTH_REDIRECT_URI

# Make them available during build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_OAUTH_REDIRECT_URI=$VITE_OAUTH_REDIRECT_URI

# Debug: Print environment variables (you can remove this after confirming it works)
RUN echo "Building with VITE_BACKEND_URL: $VITE_BACKEND_URL"
RUN echo "Building with VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID" 
RUN echo "Building with VITE_OAUTH_REDIRECT_URI: $VITE_OAUTH_REDIRECT_URI"

# Build the app
RUN npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]