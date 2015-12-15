#! /bin/bash

sudo /sbin/iptables -F
sudo /sbin/iptables -X

sudo /sbin/iptables -A INPUT  -p icmp -m state --state ESTABLISHED,RELATED     -j ACCEPT
sudo /sbin/iptables -A INPUT  -m state --state ESTABLISHED                     -j ACCEPT
sudo /sbin/iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo /sbin/iptables -A OUTPUT -p icmp -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
sudo /sbin/iptables -A OUTPUT -m state --state NEW,ESTABLISHED                 -j ACCEPT

sudo /sbin/iptables -A INPUT -p tcp --dport 22 -j ACCEPT

sudo /sbin/iptables -A INPUT -i eth1 -p tcp --dport 3434 -j ACCEPT

sudo /sbin/iptables -A INPUT -i lo -j ACCEPT

sudo /sbin/iptables -P INPUT DROP
sudo /sbin/iptables -P FORWARD DROP
sudo /sbin/iptables -P OUTPUT ACCEPT
