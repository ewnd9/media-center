#!/bin/bash

set -e

export TRAKT_ID=412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f
export TRAKT_SECRET=714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb

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
