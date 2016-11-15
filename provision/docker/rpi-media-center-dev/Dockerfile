FROM node:6.9.1-slim

EXPOSE 3000
WORKDIR /app

RUN npm install -g yarn@0.16

RUN apt-get update
RUN apt-get install python make g++ g++-4.8 -y

CMD npm start
