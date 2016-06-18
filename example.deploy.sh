#!/bin/sh

set -e

HOST="pi@<your-pi-ip>"

DOCKERFILE="~/mc/docker-compose.yml"

START_SCRIPT="start-docker-compose-production.sh"
START_SCRIPT_DEST="~/mc/$START_SCRIPT"

scp ./provision/docker-compose.yml $HOST:$DOCKERFILE
scp ./$START_SCRIPT $HOST:$START_SCRIPT_DEST

ssh $HOST -t "$START_SCRIPT_DEST $DOCKERFILE"
