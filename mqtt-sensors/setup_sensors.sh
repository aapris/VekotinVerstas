#!/usr/bin/env bash

# Install supervisor to monitor the python scripts
sudo apt-get install -y supervisor

# Make GATT service/char conf files available for bleno app
for f in *.json
do
   sudo cp -v "$f" /etc/rpi-ble-services/"$f"
done

# Overwrite supervisord to start monitoring our scripts
sudo cp -v supervisord.conf.example /home/pi/tmp/supervisord.conf

# Restart supervisord with new config
sudo service supervisod restart
