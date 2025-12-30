############################
# Runtime Image
############################
FROM node:18-alpine

# Set runtime environment explicitly
ENV NODE_ENV=production

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests only (layer caching)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY . .

# Set file ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Document exposed port
EXPOSE 4000

# Use exec form (no shell)
CMD ["node", "server.js"]
