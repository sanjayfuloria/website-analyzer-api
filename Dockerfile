FROM node:20-slim

WORKDIR /app

# Copy all source files
COPY package*.json ./
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
