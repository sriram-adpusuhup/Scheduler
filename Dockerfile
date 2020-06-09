FROM node:10

WORKDIR /usr/server

COPY package.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]