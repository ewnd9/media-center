FROM hypriot/rpi-node:5.11.1-wheezy

EXPOSE 3000

RUN npm install -g embedded-error-board@0.1.1
WORKDIR /db

CMD error-board db
