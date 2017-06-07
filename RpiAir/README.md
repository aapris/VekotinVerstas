Testing SDS011 PM sensor module
===============================

On linux
--------

First install python serial:

`sudo apt install python-serial`

Then run sds011 like this:

`python sds011.py /dev/ttyUSB0 /tmp/foo.json`

On Mac Os X
-----------

Install *CH341SER_MAC-1.4* USB Serial bridge CH340 drivers from here:
https://blog.sengotta.net/signed-mac-os-driver-for-winchiphead-ch340-serial-bridge/

Reboot.

Create python virtualenv or similar and install python serial:

`pip install pyserial`

Then run sds011 like this:

`python sds011.py /dev/cu.wchusbserial1410 /tmp/foo.json`
