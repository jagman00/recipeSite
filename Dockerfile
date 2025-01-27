# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-slim AS base

# Node.js/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
RUN apt-get update -y && apt-get install -y openssl

# Throw-away build stage to reduce size of final image


# Install packages needed to build node modules

# Install node modules
COPY . .
RUN npm install

# Generate Prisma Client
COPY prisma .
RUN npx prisma generate

EXPOSE 3000
CMD [ "node", "server.js" ]
