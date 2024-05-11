# Start your image with a node base image
FROM node:18-alpine

# The /app directory should act as the main application directory
WORKDIR /app

# Copy all files from current directory to /app in the image
COPY . .

# Install node packages
RUN npm install

# Start the app using serve command
CMD [ "node", "." ]