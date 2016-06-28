#!/bin/bash

set -e

if [[ $# != 1 ]]; then
  echo "Usage: ./backup.sh <pi@127.0.0.1>"
  exit 1
fi

DATE=`date +%m-%d-%Y-%H:%M`
FILE="mc-$DATE.zip"
HOST="$1"

ssh $HOST -t "zip -r $FILE ~/mc/mc-db"
scp $HOST:~/$FILE .
