# Use the official Node.js image as a base image
FROM node

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# eXPOSERING THE PORT
EXPOSE 5173

# Start Nginx when the container starts
CMD ["npm", "run", "dev"]