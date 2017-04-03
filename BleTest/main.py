from network import Bluetooth
import time
from machine import Timer

bluetooth = Bluetooth()
bluetooth.set_advertisement(name='LoPy', service_uuid=b'1234567890123456')

def conn_cb(bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)
bluetooth.advertise(True)

srv1 = bluetooth.service(uuid=b'1234567890123456', isprimary=True)
chr1 = srv1.characteristic(uuid=b'ab34567890123456', value=5)

srv2 = bluetooth.service(uuid=b'1234567890123457', isprimary=True)
chr2 = srv2.characteristic(uuid=b'ab34567890123457')


def char1_cb(chr):
    print("Write request with value = {}".format(chr.value()))

def char1_cb2(chr):
    print("READ request")

char1_cb = chr2.callback(trigger=Bluetooth.CHAR_WRITE_EVENT, handler=char1_cb)
char1_cb2 = chr1.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char1_cb2)

class Clock:

    def __init__(self,  chr):
        self.chr = chr
        self.seconds = 0
        self.val = b'foo={}'.format(time.time())
        self.chr.value(self.val)
        self.__alarm = Timer.Alarm(self._seconds_handler, 1, periodic=True)

    def _seconds_handler(self, alarm):
        self.val = b'foo={}'.format(time.time())
        self.chr.value(self.val)
        #self.seconds += 1
        #print("%02d seconds have passed" % self.seconds)
        #if self.seconds == 10:
        #    alarm.callback(None) # stop counting after 10 seconds

clock = Clock(chr1)
