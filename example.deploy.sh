#!/bin/sh

npm run build:backend
# NODE_ENV=production webpack

REMOTE=user@ip
rsync --exclude node_modules --exclude .git -av ./ $REMOTE:~/media-center
