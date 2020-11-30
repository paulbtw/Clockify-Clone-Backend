FROM node

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build

EXPOSE 80

ENV NODE_ENV production

CMD ["node","./dist/index.js"]