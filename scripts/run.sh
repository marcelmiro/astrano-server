#!/bin/bash

# Set NODE_ENV if exists
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

# Move to working directory
cd /home/ec2-user/astrano-server

# Start pm2 process
pm2 start dist/index.js -n api -i 0
