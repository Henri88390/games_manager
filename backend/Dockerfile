FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure proper node_modules ownership and permissions
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]