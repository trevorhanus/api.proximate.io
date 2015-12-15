#! /bin/bash

echo
echo Restarting api1.sfo1
echo

ssh api1.sfo1.bridgechat.io 'bash -s' < ./scripts/restart_remote.sh

echo
echo Restarting api2.sfo1
echo

ssh api2.sfo1.bridgechat.io 'bash -s' < ./scripts/restart_remote.sh

echo
echo Restarting api1.nyc3
echo

ssh api1.nyc3.bridgechat.io 'bash -s' < ./scripts/restart_remote.sh
