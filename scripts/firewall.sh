#! /bin/bash

echo Configuring the Firewall on api1.sfo1
ssh api1.sfo1.bridgechat.io 'bash -s' < ./scripts/firewall_remote_api.sh

echo Configuring the Firewall on api1.nyc3
ssh api1.nyc3.bridgechat.io 'bash -s' < ./scripts/firewall_remote_api.sh

echo Configuring the Firewall on lb1.sfo1
ssh lb1.sfo1.bridgechat.io 'bash -s' < ./scripts/firewall_remote_lb.sh

echo Configuring the Firewall on lb1.nyc3
ssh lb1.nyc3.bridgechat.io 'bash -s' < ./scripts/firewall_remote_lb.sh
