var bleno = require('bleno');
var os = require('os');
var util = require('util');
var SerialPort = require('serialport');

const SERIAL_DEVICE = "/dev/ttyUSB0";
const BAUD_RATE = 9600;
const SERIAL_BUFFERSIZE = 10;

var PM10 = NaN
var PM25 = NaN


var port = new SerialPort(SERIAL_DEVICE, {
    baudRate: BAUD_RATE,
    // parser: SerialPort.parsers.delimiter()
    parser: SerialPort.parsers.byteLength(SERIAL_BUFFERSIZE)
});

port.on('open', () => {
    console.log('Opened serial port!')
});
port.on('error', (err) => {
    console.log('Serial port error: ', err.message);
})
port.on('data', (data) =>{
    // console.log(data);
    PM25 = data.readIntLE(2, 2) / 10
    PM10 = data.readIntLE(4, 2) / 10
});

var BlenoCharacteristic = bleno.Characteristic;

var ParticulateCharacteristic = function() {
    ParticulateCharacteristic.super_.call(this, {
        // uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10',
        uuid: '9ece1216-4ae7-4ff2-8600-cb9c7a46c1be',
        properties: ['read'],
    });

    this._value = new Buffer(0);
};

ParticulateCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
        this._value = new Buffer(JSON.stringify({
          'PM2.5' : PM25,
          'PM10' : PM10
        }));
  }

  console.log('ParticulateCharacteristic - onReadRequest: value = ' +
    this._value.slice(offset, offset + bleno.mtu).toString()
  );

  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

util.inherits(ParticulateCharacteristic, BlenoCharacteristic);
module.exports = ParticulateCharacteristic;
