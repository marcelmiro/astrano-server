#!/bin/bash

# Add node to startup 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Move to working directory
cd /home/ec2-user/astrano-server

# Stop pm2 process
pm2 stop server || true
