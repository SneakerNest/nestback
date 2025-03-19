# Use the official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies like nodemon)
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the entire project
COPY . .

# Expose the application port
EXPOSE 5001

# Command to run the application
CMD ["npm", "run", "dev"]
