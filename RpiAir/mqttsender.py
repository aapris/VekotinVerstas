# coding=utf-8

import sys
import time
import paho.mqtt.client as paho
from mqttconfig import MQTTCONFIG as C


def on_connect(client, userdata, flags, rc):
    print("MQTT CONNACK received with code %d." % (rc))
    client.subscribe("#")


# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    msg_data = msg.payload.decode('utf-8')
    print(msg.topic+" "+str(msg_data))


client = paho.Client()
client.username_pw_set(C['user'], C['pass'])
client.on_connect = on_connect
client.on_message = on_message
client.connect(C['host'], C['port'])
# client.loop_start()


def main(arg):
    global client
    try:
        msg = 'Just woke up!'
        (rc, mid) = client.publish(C['topic'], msg, qos=0)
        client.loop_start()
        time.sleep(10)
    except KeyboardInterrupt:
        print("Ctrl-c received, Bye bye!")
        exit()

if __name__ == '__main__':
    main(sys.argv)

