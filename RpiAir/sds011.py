# coding=utf-8
"""
TODO:
check sleep command from here!
    http://www.codegists.com/snippet/python/sds011_kadamski_python
"""

from __future__ import print_function
import serial
import struct, sys
import sys
import datetime


class Sds011Reader:

    def __init__(self, port, baudrate=9600):
        self.ser = serial.Serial()
        self.ser.port = port #  sys.argv[1]
        self.ser.baudrate = baudrate
        self.ser.open()
        self.ser.flushInput()
        self.byte, self.data = 0, ""

    def process_frame(self, d):
        r = struct.unpack('<HHxxBBB', d[2:])
        pm25 = r[0]/10.0
        pm10 = r[1]/10.0
        checksum = sum(ord(v) for v in d[2:8]) % 256
        ok = checksum == r[2] and r[3] == 0xab
        return pm25, pm10, ok
        
    def read_forever(self):
        while True:
            #print(self.byte)
            while self.byte != "\xaa":
                self.byte = self.ser.read(size=1)
            d = self.ser.read(size=10)
            if d[0] == "\xc0":
                pm25, pm10, ok = self.process_frame(self.byte + d)
                yield pm25, pm10, ok

    def process_frame3(self, d):
        r = struct.unpack('<HHxxBBB', d[2:])
        pm25 = r[0]/10.0
        pm10 = r[1]/10.0
        #checksum = sum(ord(v) for v in d[2:8]) % 256
        checksum = sum(v for v in d[2:8]) % 256
        ok = checksum == r[2] and r[3] == 0xab
        return pm25, pm10, ok
        
    def read_forever3(self):
        while True:
            while self.byte != b"\xaa":
                print(self.byte, type(self.byte))
                self.byte = self.ser.read(size=1)
            d = self.ser.read(size=10)
            #print("FRAME", d, len(d), type(d), d[0])
            #if d[0] == b"\xc0":
            if d[0] == 192:
                pm25, pm10, ok = self.process_frame3(self.byte + d)
                yield pm25, pm10, ok

def main(port, fname=None):
    sds011 = Sds011Reader(port)
    if fname is None:
        f = None
    else:
        f = open(fname, 'at')
    if sys.version_info[0] == 2:
        for pm25, pm10, ok in sds011.read_forever():
            ts = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            print("PM 2.5: {} μg/m^3  PM 10: {} μg/m^3 CRC={}".format(pm25, pm10, "OK" if ok else "NOK"))
            if f is not None:
                msg = '{} pm2_5={} pm10={} ok='.format(ts, pm25, pm10, "OK" if ok else "NOK")
                f.write(msg + '\n')
                f.flush()
    else:
        for pm25, pm10, ok in sds011.read_forever3():
            print("PM 2.5: {} μg/m^3  PM 10: {} μg/m^3 CRC={}".format(pm25, pm10, "OK" if ok else "NOK"))
        #print(pm25, pm10, ok)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Run me:\n    python {} /dev/ttyUSB0".format(sys.argv[0]))
        sys.exit(1)
    fname = sys.argv[2] if sys.argv[2] else None
    main(sys.argv[1], fname)

# serial port in mac:
# '/dev/cu.wchusbserial1410'
