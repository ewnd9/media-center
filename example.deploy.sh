#!/bin/sh

set -e

## =====
## setup your variables

IP="your-ip"
HOST="pi@$IP"
DEST_DIR="/home/pi/mc"
TRAKT_TOKEN="<>"

## =====

APP_DIR="$DEST_DIR/app"

START_SCRIPT="start-docker-compose-production.sh"
START_SCRIPT_DEST="$APP_DIR/$START_SCRIPT"

export ERROR_BOARD_URL="http://$IP:5000/api/v1" # exported for build:frontend

cat > $START_SCRIPT << EOF
#!/bin/sh

export DATA="$DEST_DIR/mc-data"
export DATA_TRASH="$DEST_DIR/mc-trash"
export DB="$DEST_DIR/mc-db"
export CACHE="$DEST_DIR/mc-cache"
export TRAKT_TOKEN="$TRAKT_TOKEN"
export ERROR_BOARD_URL="$ERROR_BOARD_URL"

mkdir -p "\$CACHE/minidlna-db"

docker-compose up -d --build
EOF

chmod +x $START_SCRIPT

npm run build:backend
npm run build:frontend

node -e "require('fs').writeFileSync('./deps.json', JSON.stringify({ dependencies: require('./package.json').dependencies }))"

rm -rf release
mkdir release

cp $START_SCRIPT release

cp app.js release
cp deps.json release
cp provision/docker-compose.yml release
cp provision/docker/rpi-media-center/Dockerfile release

cp -r lib release
cp -r public release
cp -r provision release

rsync -avz --delete release/ $HOST:$APP_DIR
ssh $HOST -t "cd $APP_DIR && $START_SCRIPT_DEST ./"

rm -rf release
