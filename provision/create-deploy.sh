#!/bin/sh

cat > provision/$START_SCRIPT << EOF
#!/bin/sh

export DATA="$DATA_DIR"
export DB="$DB_DIR"
export CACHE="$CACHE_DIR"
export TRAKT_TOKEN="$TRAKT_TOKEN"
export ERROR_BOARD_URL="$ERROR_BOARD_URL"

mkdir -p "\$CACHE/minidlna-db"

docker-compose up -d --build
EOF
