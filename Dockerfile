FROM node:16.18-alpine3.16 as build

WORKDIR /usr/src/app

COPY package*.json .
COPY server/package*.json ./server/

RUN yarn install

COPY ./server/. ./server/.
COPY . .

ENV NODE_ENV production

RUN yarn server:build

FROM node:16.18-alpine3.16

WORKDIR /usr/src/app

COPY server/package*.json .

ENV NODE_ENV production

RUN yarn install --production

COPY --from=build /usr/src/app/server/build /usr/src/app/build

EXPOSE 5000

CMD ["node", "build/index.js"]