#! /bin/bash

sudo su codydaig
source /home/codydaig/.profile
cd /home/codydaig/api.bridgechat.io
git pull origin master
npm install
pm2 restart bridge
exit
