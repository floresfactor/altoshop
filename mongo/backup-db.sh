#!/bin/bash

dirname=$(date '+%d-%b-%Y-%Hh-%Mm-%Ss');
echo -e "Creating directory '/usr/local/mongodb/production/backup/$dirname' in backup folder...";
mkdir /usr/local/mongodb/production/backup/$dirname;

echo "Generating mongodump from container name: 'mongodb'...";
docker exec -i mongodb mongodump --out /data/backup/$dirname/ --username dbAdmin --password totoGarigol
echo "done";