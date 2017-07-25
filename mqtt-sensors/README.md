# Scripts for reading sensors and broadcasting measurements to local MQTT

Make sure virtualenv is installed: `sudo apt-get install virtualenv`. Then go `virtualenv -p python3 env` to create one. After activating the virtualenv (`. env/bin/activate`), install the requirements: `pip install -r requirements.txt`.

Either take the following steps or say `sudo ./setup_sensors.sh`, which does them for you:

- Install supervisor: `sudo apt-get install -y supervisor`
- Copy the configuration files (*.json) into `/etc/rpi-ble-services` for the Node bleno app to find and use.
- Copy `sds011.conf.example` to `/etc/supervisor/conf.d/sds011.conf`, reread the configuration and update supervisord process. Finally check the status:

```
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```
**NB** For the bme280 sensor to work, additional steps (enabling the i2c interface) might be needed. Details in [bme280.md](bme280.md)
