#! /bin/bash

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git
sudo apt-get install --yes build-essential

cd /home/codydaig/
git clone git@github.com:codydaig/api.bridgechat.io.git
cd api.bridgechat.io
npm install
sudo npm install -g pm2
pm2 start index.js --name bridge
