# Readable BLE service for Raspberry Pi

Sets up a BLE service that provides air quality sensor data as characteristics. Reads an sds011 particulate sensor over USB serial.

## Usage
### From scratch (empty SD card)
1. Start with latest [Raspbian image](https://downloads.raspberrypi.org/raspbian_lite_latest)

2. Use [Etcher](http://www.etcher.io) to flash the image to disk (or `dd` why not)

3. Add a known network to the wpa_supplicant.conf file so you can connect via SSH:
`ẁpa_passphrase SSID PASSWORD >> /media/USER/UUID/etc/wpa_supplicant/wpa_supplicant.conf`

4. Enable SSH on the system by adding an empty filed named "SSH" into the boot partition: `touch /media/USER/boot/SSH`. Pop the SD-card into the Raspberry Pi, power it up, and join the same Wifi network, `ssh pi@raspberrypi.local`. Consider changing the password for the `pi` user.

5. On the Pi, do
```
sudo apt-get update
sudo apt-get upgrade
```

5. Install git
`sudo apt-get -y install git`

6. Install Node (ARMv6 arch for Rpi) from https://nodejs.org/en/download:
```
wget https://nodejs.org/dist/v6.10.3/node-v6.10.3-linux-armv6l.tar.xz
tar -xvf node-v6.10.3-linux-armv6l.tar.xz
sudo cp -r node-v6.10.3-linux-armv6l/{bin,include,lib,share} /usr/local
rm -rf node-v6.10.3-linux-armv6l
```

7. Install Redis: `sudo apt-get install redis-server` It will be used by the local MQTT broker, which decouples the sensors from the BLE service app.

7. Install dependencies: `npm install`. This will take a loong time on the RPi Zero W.

Run service: `npm start`

### Run the BLE service always (at startup)

We'll use `pm2` to start up, monitor, and restart the app if needed. Install it: `sudo npm install -g pm2`

Start the app (need to sudo to use Bluetooth) under pm2: `sudo -E pm2 start index.js --name ble-services`

Generate startup script: `sudo -E pm2 startup`, and save the list of running apps: `sudo -E pm2 save`,
