#!/bin/bash

set -e

if [[ $# != 1 ]]; then
  echo "Usage: ./release-docker.sh <0.1.x>"
  exit 1
fi

# run from the root of the project
cp ./provision/docker/rpi-media-center/Dockerfile ./Dockerfile
node -e "require('fs').writeFileSync('./.deps.json', JSON.stringify({ dependencies: require('./package.json').dependencies }))"

docker build -t ewnd9/media-center .
docker tag ewnd9/media-center ewnd9/media-center:$1
docker push ewnd9/media-center:$1
