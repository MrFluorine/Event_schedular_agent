# Use Node.js for building and serving the React app
FROM node:18-alpine as build

WORKDIR /app


# Copy source code
COPY . .

RUN rm -rf node_modules dist package-lock.json \
    && npm install \
    && npm install --save-dev terser \
    && npm run build


# Use nginx to serve the built app
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]