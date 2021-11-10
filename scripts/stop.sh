#!/bin/bash

# Move to working directory
cd /home/ec2-user/astrano-api

# Stop pm2 process
pm2 stop api || true
