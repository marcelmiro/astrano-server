#!/bin/bash
set -e

# Update instance
sudo yum update -y

# Install node js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# Add node to startup
hasRc=`grep "su -l $USER" /etc/rc.d/rc.local | cat`
if [ -z "$hasRc" ]; then
    sudo sh -c "echo 'su -l $USER -c \"cd ~/node;sh ./run.sh\"' >> /etc/rc.d/rc.local"
fi

# Install global npm required packages
npm i -g typescript pm2
pm2 updatePM2

# Create working directory if not exists
DIR="/home/ec2-user/astrano-server"
if [ ! -d "$DIR" ]; then
  mkdir ${DIR}
fi
