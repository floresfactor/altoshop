#!/bin/bash
echo "Checking enviroment..."
if [[ "$NODE_ENV" = "production" ]]
then
  echo "Running on production"
  pm2-docker ./tools/prodServer.js $@
else
  echo "Running on staging"
  pm2-docker ./tools/stagingServer.js $@
fi
