#!/bin/sh

export DATA="/home/pi/mc/mc-data"
export DB="/home/pi/mc/mc-db"
export CACHE="/home/pi/mc/mc-cache"

mkdir -p "$CACHE/minidlna-db"

docker-compose -f $1 up -d
