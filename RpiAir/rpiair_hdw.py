import sys
import logging
import datetime
import time 
import random
import json
import paho.mqtt.client as paho
from sds011 import Sds011Reader
from mqttconfig import MQTTCONFIG as C
from mqttconfig import INTERVAL


def getserial():
    # Extract serial from cpuinfo file
    cpuserial = "0000000000000000"
    try:
        f = open('/proc/cpuinfo','r')
        for line in f:
            if line[0:6]=='Serial':
                cpuserial = line[10:26]
        f.close()
    except:
        cpuserial = "ERROR000000000"
    return cpuserial


def on_connect(client, userdata, flags, rc):
    print("MQTT CONNACK received with code %d." % (rc))


def main(arg):
    client = paho.Client()
    client.username_pw_set(C['user'], C['pass'])
    client.on_connect = on_connect
    client.connect(C['host'], C['port'])
    client.loop_start()

    sds011 = Sds011Reader(sys.argv[1])
    d = {}
    d['id'] = getserial()
    d['title'] = 'FVH office RpiAir'
    last_msg = 0
    for pm2_5, pm10, ok in sds011.read_forever3():
        if ok:
            d['timestamp'] = datetime.datetime.utcnow().strftime('%Y-%d-%mT%H:%M:%SZ')
            d['pm2.5'] = pm2_5
            d['pm10'] = pm10 
            d['data'] = pm10 * 10
            d['pmok'] = ok
        if last_msg + INTERVAL < time.time():
            print(json.dumps(d, indent=1))
            msg = json.dumps(d)
            (rc, mid) = client.publish(C['topic'], msg, qos=0)
            last_msg = time.time()


if __name__ == '__main__':
    main(sys.argv)
