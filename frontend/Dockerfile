# Stage 1: Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm install --save-dev terser && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]