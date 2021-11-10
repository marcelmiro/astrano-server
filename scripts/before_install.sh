#!/bin/bash
set -e

# Update instance
sudo yum update -y

# Install node js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# Install global npm required packages
npm i -g typescript pm2
sudo pm2 udpate

# Create working directory if not exists
DIR="/home/ec2-user/astrano-api"
if [ ! -d "$DIR" ]; then
  mkdir ${DIR}
fi
