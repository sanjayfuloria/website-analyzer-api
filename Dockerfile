FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy source code (needed for build step)
COPY tsconfig.json ./
COPY build.js ./
COPY server.ts ./

# Install dependencies and build
RUN npm install && npm run build

# Expose port
EXPOSE 7860

# Set environment variable for Hugging Face Spaces
ENV PORT=7860

# Start the server
CMD ["node", "build/server.js"]
