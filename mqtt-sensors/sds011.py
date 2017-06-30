# -*- coding: utf-8 -*-
"""
TODO:
check sleep command from here!
    http://www.codegists.com/snippet/python/sds011_kadamski_python
"""

import serial
import struct
import asyncio
import sys
import logging
from hbmqtt.client import MQTTClient, ConnectException

PM25_TOPIC = '/PM25'
PM10_TOPIC = '/PM10'
BUFFER_LEN = 10


@asyncio.coroutine
def publish(topic, avg):
    try:
        C = MQTTClient()
        ret = yield from C.connect('mqtt://localhost:1883/')
        payload = '{}'.format(avg).encode('ascii') #need byte string to publish
        message = yield from C.publish(topic, payload)
        logging.info("message {} to topic {} published".format(payload, topic))
        # print("message {} to topic {} published".format(payload, topic))
        yield from C.disconnect()
    except ConnectException as ce:
        logging.error("Connection failed: {}".format(ce))
        # print("Connection failed: {}".format(ce))
    yield None


class Sds011Reader:
    def __init__(self, port, baudrate=9600):
        self.ser = serial.Serial()
        self.ser.port = port #  sys.argv[1]
        self.ser.baudrate = baudrate
        try:
            self.ser.open()
        except Exception as e:
            logging.error("Failed to open serial port. {}".format(e))
        self.ser.flushInput()
        self.byte, self.data = 0, ""

    def process_frame(self, d):
        r = struct.unpack('<HHxxBBB', d[2:])
        pm25 = r[0]/10.0
        pm10 = r[1]/10.0
        checksum = sum(v for v in d[2:8]) % 256
        ok = checksum == r[2] and r[3] == 0xab
        return pm25, pm10, ok

    @asyncio.coroutine
    def read_forever(self):
        while True:
            while self.byte != b"\xaa":
                self.byte = self.ser.read(size=1)

            d = self.ser.read(size=10)
            # if d[0] == b"\xc0":
            if d[0] == 192:
                pm25, pm10, ok = self.process_frame(self.byte + d)
                yield pm25, pm10, ok


@asyncio.coroutine
def measure(sds011, buffer_len):
    # READ SENSOR FOREVER, ALWAYS APPEND NEW VAL TO BUFFER WHILE DROPPING THE OLDEST
    # PUBLISH TO MQTT PERIODICALLY THE AVG OF THAT BUFFER

    pm25_buffer = []
    pm10_buffer = []


    for pm25, pm10, ok in sds011.read_forever():
        print(u"PM 2.5: {} μg/m^3  PM 10: {} μg/m^3 CRC={}".format(pm25, pm10, "OK" if ok else "NOK"))

        if not ok:
            continue

        pm25_buffer.append(pm25)
        pm10_buffer.append(pm10)

        if len(pm25_buffer) >= buffer_len:
            # print(buffer_len)
            pm25avg = float(sum(pm25_buffer)) / len(pm25_buffer)
            yield from publish(PM25_TOPIC, pm25avg)
            pm25_buffer = []

        if len(pm10_buffer) >= buffer_len:
            # print(pm10_buffer)
            pm10avg = float(sum(pm10_buffer)) / len(pm10_buffer)
            yield from publish(PM10_TOPIC, pm10avg)
            pm10_buffer = []


def main(port):
    sds011 = Sds011Reader(port)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(measure(sds011, BUFFER_LEN))
    loop.run_forever()


if __name__ == "__main__":
    formatter = "[%(asctime)s] %(name)s {%(filename)s:%(lineno)d} %(levelname)s - %(message)s"
    logging.getLogger('asyncio')
    logging.basicConfig(filename='sds011.log', level=logging.INFO, format=formatter)
    if len(sys.argv) < 1:
        print("Run me:\n    python {} /dev/ttyUSB0".format(sys.argv[0]))
        sys.exit(1)
    main(sys.argv[1])

# serial port in mac:
# '/dev/cu.wchusbserial1410'
