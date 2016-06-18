FROM ewnd9/rpi-node-omxplayer

EXPOSE 4000

RUN mkdir app

COPY package.json /app/package.json
COPY app.js /app/app.js
COPY lib /app/lib
COPY public /app/public

WORKDIR /app

RUN npm install --production
CMD node /app/app.js
