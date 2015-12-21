#!/bin/sh

npm run build:backend
NODE_ENV=production webpack

REMOTE=user@ip
DEST=/home/pi/media-center
rsync --exclude node_modules --exclude .git -av ./ $REMOTE:$DEST

ssh $REMOTE "cd $DEST && time npm install --production"
