FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

COPY entrypoint.js .

EXPOSE 3000

CMD ["node", "entrypoint.js"]