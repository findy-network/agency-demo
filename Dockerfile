FROM node:16.18-alpine3.16 as build

WORKDIR /usr/src/app

COPY package*.json .
COPY yarn* .
COPY server/package*.json ./server/

RUN yarn install

COPY ./server/. ./server/.
COPY . .

ENV NODE_ENV production

RUN yarn server:build

# TODO: yarn not handling binaries properly, so install findy-common-ts separately
RUN apk update && apk add curl && \
    curl https://raw.githubusercontent.com/findy-network/findy-agent-cli/HEAD/install.sh > install.sh && \
    chmod a+x install.sh && \
    ./install.sh -b /bin && \
    mv /bin/findy-agent-cli /bin/findy-common-ts


FROM node:16.18-alpine3.16

WORKDIR /usr/src/app

COPY server/package*.json .

RUN yarn install --production

# TODO: yarn not handling binaries properly, so install findy-common-ts separately
COPY --from=build /bin/findy-common-ts /bin/findy-common-ts

ENV NODE_ENV production
# TODO: yarn not handling binaries properly, so modify path manually
ENV PATH ${PATH}:/usr/src/app/node_modules/.bin

COPY --from=build /usr/src/app/server/build /usr/src/app

EXPOSE 5000

CMD ["node", "index.js"]
