#!/bin/bash
set -e

# Update instance
sudo yum update -y

# Install node js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# Add node to startup 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install global npm required packages
npm i -g typescript pm2
pm2 updatePM2

# Create working directory if not exists
DIR="/home/ec2-user/astrano-server"
if [ ! -d "$DIR" ]; then
  mkdir ${DIR}
fi
