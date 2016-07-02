FROM ewnd9/rpi-node-omxplayer

EXPOSE 4000

RUN mkdir app

WORKDIR /app
CMD node /app/app.js

COPY deps.json /app/package.json
RUN npm install --production

COPY app.js /app/app.js
COPY lib /app/lib
COPY public /app/public
