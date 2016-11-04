#!/bin/sh

cat > provision/$BACKUP_SCRIPT << EOF
#!/bin/sh

DATE=\`date +%m-%d-%Y-%H-%M\`
FILE="mc-\$DATE"

tar -cvf "\$FILE.tar" $DB_DIR
EOF
