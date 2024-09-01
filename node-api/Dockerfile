# Stage 1: Build the application
FROM node:lts AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the application files
COPY .env ./
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build


FROM node:lts as runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY PattesPartage.jar /var/app/build/PattesPartage.jar

# Copy any other necessary files, e.g., .env
COPY .env ./

# Copy the TypeScript configuration file
COPY tsconfig.json .

# Expose the application port
EXPOSE 3000

# Set the command to run the application
CMD ["node", "dist/index.js"]

