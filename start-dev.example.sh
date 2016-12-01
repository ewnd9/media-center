#!/bin/bash

set -e

export TRAKT_TOKEN="<>"

export MEDIA="data/media"
export DATA="data/data"
export DB="data/db"
export CACHE="data/cache"

export PLAYER=mock

FILES="-f provision/docker-compose-base-arm.yml -f provision/docker-compose-dev.yml"

if [ "$1" == "run" ]; then
  shift
  docker-compose $FILES run --no-deps app $@
elif [ "$1" == "exec" ]; then
  shift
  docker-compose $FILES exec --no-deps app $@
else
  docker-compose $FILES up $@
fi
