FROM ewnd9/rpi-node-omxplayer:6.3.1

EXPOSE 4000

RUN mkdir app

WORKDIR /app

RUN npm install -g yarn@0.16

COPY deps.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --production

CMD node /app/app/app.js
