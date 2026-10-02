FROM node:lts-slim AS build

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for the build)
RUN npm install --force

# Copy source files
COPY . .

# Build the application
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:lts-slim AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --force

# Copy compiled dist from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the application port
EXPOSE ${PORT}

CMD ["node", "dist/main.js"]