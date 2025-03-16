# Use the official Node.js image as the base image
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Use a smaller image for the final stage
FROM node:22-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/locales ./locales
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./


# Expose the port your app runs on (default is 3000 for Next.js)
EXPOSE 3036

# Start the app
CMD ["node", ".next/standalone/server.js"]