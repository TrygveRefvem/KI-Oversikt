FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV PORT=80
ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "server.js"] 