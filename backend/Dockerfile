FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy default images to a permanent location in the container
COPY default-images/ /app/default-images/

# Ensure uploads directory exists
RUN mkdir -p uploads

# Copy and set permissions for entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Ensure proper node_modules ownership and permissions
RUN chown -R node:node /app
USER node

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "dev"]