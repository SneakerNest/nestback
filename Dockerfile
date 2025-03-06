# Use the official Node.js image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire src directory
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "server.js"]  # Ensure this points to the correct path for server.js