import sys
from sds011 import Sds011Reader
from mqttsender import client

if len(sys.argv) > 1:
    port = sys.argv[1]
else:
    port = '/dev/ttyUSB0'

sds011 = Sds011Reader(port)

for pm25, pm10, ok in sds011.read_forever3():
    print("PM 2.5: {} μg/m^3  PM 10: {} μg/m^3 CRC={}".format(pm25, pm10, "OK" if ok else "NOK"))
    msg = '{},{},{}'.format(pm25, pm10, "OK" if ok else "NOK")
    (rc, mid) = client.publish("sensor/sds011", msg, qos=0)

