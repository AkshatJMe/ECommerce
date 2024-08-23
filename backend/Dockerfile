# Use the official Node.js image as a base image
FROM node

RUN addgroup app && adduser -S -G app app

USER app

WORKDIR /app

COPY package*.json ./

# change ownership of the /app directory to the app user
USER root

# change ownership of the /app directory to the app user
# chown -R <user>:<group> <directory>
# chown command changes the user and/or group ownership of for given file.
RUN chown -R app:app .

# change the user back to the app user
USER app

RUN npm install

COPY . . 

# Install dependencies
RUN npm run build

# Exposeing the PORT
EXPOSE 4000

# Define the command to run the application
CMD ["npm", "run", "start"]