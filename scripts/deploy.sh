#! /bin/bash

git push origin master

echo
echo
echo Deploying to api1.sfo1
echo
echo

ssh api1.sfo1.bridgechat.io 'bash -s' < ./scripts/deploy_remote.sh

echo
echo
echo Deploying to api1.sfo1
echo
echo

ssh api2.sfo1.bridgechat.io 'bash -s' < ./scripts/deploy_remote.sh

echo
echo
echo Deploying to api1.nyc3
echo
echo

ssh api1.nyc3.bridgechat.io 'bash -s' < ./scripts/deploy_remote.sh

echo
echo
echo GETTING SERVER STATUS

source ./scripts/status.sh
