############################
# Stage 1: Build
############################
FROM node:18-alpine AS build

# Build-time argument (NOT a secret)
ARG REACT_APP_API_URL=https://drwheels-api.chickenkiller.com/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Set working directory
WORKDIR /app

# Copy only dependency manifests first (layer caching)
COPY package.json package-lock.json ./

# Install dependencies in clean, reproducible way
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN DISABLE_ESLINT_PLUGIN=true npm run build

############################
# Stage 2: Runtime
############################
FROM nginx:1.29-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts only
COPY --from=build /app/build /usr/share/nginx/html

# # Use non-root user
# USER nginx

# Expose container port (documentation only)
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
