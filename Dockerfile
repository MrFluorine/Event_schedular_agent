# Use Node.js for building and serving the React app
FROM node:18-alpine as build

WORKDIR /app

# If your React app is in a subdirectory, adjust the path accordingly
# For example, if it's in frontend/ directory:
# COPY frontend/package*.json ./
# COPY frontend/ .

# Copy the entire repository first
COPY . .

# Navigate to the frontend directory (adjust path as needed)
# If your files are in root, remove the next line
# WORKDIR /app/frontend

# Environment variables will be injected by Cloud Run during build
ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_OAUTH_REDIRECT_URI

# Make them available during build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_OAUTH_REDIRECT_URI=$VITE_OAUTH_REDIRECT_URI

# Debug: Show directory structure and environment variables
RUN echo "Current directory contents:"
RUN ls -la
RUN echo "Environment variables:"
RUN echo "VITE_BACKEND_URL: $VITE_BACKEND_URL"
RUN echo "VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
RUN echo "VITE_OAUTH_REDIRECT_URI: $VITE_OAUTH_REDIRECT_URI"

# Install dependencies and build
RUN npm ci && npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration from the appropriate location
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]