# Use Node.js 20 for building and serving the React app
FROM node:20-alpine as build

WORKDIR /app

# Copy source code
COPY . .

# For Deploy from repo, we'll use a different approach
# Build with placeholder values, then replace at runtime
ENV VITE_BACKEND_URL=__VITE_BACKEND_URL__
ENV VITE_GOOGLE_CLIENT_ID=__VITE_GOOGLE_CLIENT_ID__
ENV VITE_OAUTH_REDIRECT_URI=__VITE_OAUTH_REDIRECT_URI__

# Debug: Print environment variables during build
RUN echo "Building with Node.js version:" && node --version
RUN echo "Build-time VITE_BACKEND_URL: $VITE_BACKEND_URL"
RUN echo "Build-time VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
RUN echo "Build-time VITE_OAUTH_REDIRECT_URI: $VITE_OAUTH_REDIRECT_URI"

# Clean install and build
RUN rm -rf node_modules dist package-lock.json \
    && npm install \
    && npm install --save-dev terser \
    && npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a startup script that replaces placeholders with runtime env vars
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "Replacing environment variables in built files..."' >> /docker-entrypoint.sh && \
    echo 'find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_BACKEND_URL__|${VITE_BACKEND_URL:-}|g" {} \;' >> /docker-entrypoint.sh && \
    echo 'find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_GOOGLE_CLIENT_ID__|${VITE_GOOGLE_CLIENT_ID:-}|g" {} \;' >> /docker-entrypoint.sh && \
    echo 'find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_OAUTH_REDIRECT_URI__|${VITE_OAUTH_REDIRECT_URI:-}|g" {} \;' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 8080
CMD ["/docker-entrypoint.sh"]