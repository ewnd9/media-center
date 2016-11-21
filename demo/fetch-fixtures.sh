#!/bin/sh

REMOTE="$1"

if [ "$#" -ne 1 ]; then
  echo "Usage: ./demo/fetch-fixtures.sh <server>"
  exit 1
fi

API="$REMOTE/api/v1"
DEST="demo/__fixtures__"

curl "$API/trakt/report" | jq '.report[0]' | cat > "$DEST/trakt-report.json"
