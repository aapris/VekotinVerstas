# Scripts for reading sensors and broadcasting measurements to local MQTT

Make sure virtualenv is installed: `sudo apt-get install virtualenv`. Then go `virtualenv -p python3 env` to create one. After activating the virtualenv (`. env/bin/activate`), install the requirements: `pip install -r requirements.txt`.

Either take the following steps or say `sudo ./setup_sensors.sh`, which does them for you:

- Install supervisor: `sudo apt-get install -y supervisor`
- Copy the configuration files (*.json) into `/etc/rpi-ble-services` for the Node bleno app to find and use.
- Overwrite the `supervisord` configuration file `/etc/supervisord/supervisod.conf` with `supervisord.conf.example`. This is the default conf file with a program defined for each sensor.
