#!/bin/sh

set -e

HOST="pi@<your-pi-ip>"

DEST_DIR="~/mc"

APP_DIR="$DEST_DIR/app"

START_SCRIPT="start-docker-compose-production.sh"
START_SCRIPT_DEST="$APP_DIR/$START_SCRIPT"

npm run build:backend
npm run build:frontend

node -e "require('fs').writeFileSync('./deps.json', JSON.stringify({ dependencies: require('./package.json').dependencies }))"

scp ./provision/docker-compose.yml $HOST:$APP_DIR/docker-compose.yml
scp ./provision/docker/rpi-media-center/Dockerfile $HOST:$APP_DIR/Dockerfile
scp ./$START_SCRIPT $HOST:$START_SCRIPT_DEST

scp -r ./public $HOST:$APP_DIR/public
scp -r ./lib $HOST:$APP_DIR/lib
scp ./deps.json $HOST:$APP_DIR/deps.json
scp ./app.js $HOST:$APP_DIR/app.js

ssh $HOST -t "cd $APP_DIR && $START_SCRIPT_DEST ./"
