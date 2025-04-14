cat dockerfile
# Use the official Node.js image as the base image
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install dependencies needed for node-gyp (often required by some dependencies)
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install --legacy-peer-deps

# Copy necessary configuration files
COPY next.config.* tsconfig.json ./
COPY public ./public
COPY locales ./locales
COPY src ./src

# Build the Next.js app with increased file handle limit
ENV NODE_ENV=production
ENV UV_THREADPOOL_SIZE=256
ENV NODE_OPTIONS="--max-old-space-size=8192"
# Force Next.js to use the wasm SWC compiler which works on Alpine
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SWC_PLATFORM=wasm32-unknown-unknown

# Run the Docker-specific build script
RUN npm run build:docker

# Create a much smaller production image
FROM node:22-alpine AS runner

# Set the working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what's needed for production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/locales ./locales
COPY --from=builder /app/next.config.* ./

# Install only production dependencies in the final image
RUN npm install --only=production --legacy-peer-deps && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/cache/apk/*

# Expose the port
EXPOSE 3037

# Start the app
CMD ["npm", "start"]%                                                                                                      