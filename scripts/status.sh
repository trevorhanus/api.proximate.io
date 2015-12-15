#! /bin/bash

echo
echo Status of api1.sfo1
echo

ssh api1.sfo1.bridgechat.io 'bash -s' < ./scripts/status_remote.sh

echo
echo Status of api1.sfo1
echo

ssh api2.sfo1.bridgechat.io 'bash -s' < ./scripts/status_remote.sh

echo
echo Status of api1.nyc3
echo

ssh api1.nyc3.bridgechat.io 'bash -s' < ./scripts/status_remote.sh
