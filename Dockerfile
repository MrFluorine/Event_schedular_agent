# Use Node.js 20 for building and serving the React app (required for react-router-dom@7+)
FROM node:20-alpine as build

WORKDIR /app

# Copy source code
COPY . .

# Environment variables will be injected by Cloud Run during build
ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_OAUTH_REDIRECT_URI

# Make them available during build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_OAUTH_REDIRECT_URI=$VITE_OAUTH_REDIRECT_URI

# Debug: Print environment variables and directory contents
RUN echo "Building with Node.js version:" && node --version
RUN echo "Building with npm version:" && npm --version
RUN echo "Directory contents:" && ls -la
RUN echo "VITE_BACKEND_URL: $VITE_BACKEND_URL"
RUN echo "VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
RUN echo "VITE_OAUTH_REDIRECT_URI: $VITE_OAUTH_REDIRECT_URI"

# Clean install and build
RUN rm -rf node_modules dist package-lock.json \
    && npm install \
    && npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]