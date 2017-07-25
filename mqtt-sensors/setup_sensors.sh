#!/usr/bin/env bash

# Install supervisor to monitor the python scripts
sudo apt-get install -y supervisor

# Make GATT service/char conf files available for bleno app
sudo mkdir -vp /etc/rpi-ble-services/
for f in *.json
do
   sudo cp -v "$f" /etc/rpi-ble-services/"$f"
done

# Overwrite supervisord to start monitoring our scripts
sudo cp -vi sds011.conf.example /etc/supervisor/conf.d/sds011.conf
sudo cp -vi bme280.conf.example /etc/supervisor/conf.d/bme280.conf

# Restart supervisord with new config
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
