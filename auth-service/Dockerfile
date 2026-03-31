FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p logs

EXPOSE 8081

CMD ["node", "src/server.js"]
