FROM ewnd9/rpi-node-omxplayer

EXPOSE 4000

RUN mkdir app

COPY deps.json /app/package.json
COPY app.js /app/app.js

WORKDIR /app
RUN npm install --production
CMD node /app/app.js

COPY lib /app/lib
COPY public /app/public
