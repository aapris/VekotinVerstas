var bleno = require('bleno');
var os = require('os');
var util = require('util');
var SerialPort = require('serialport');

const SERIAL_DEVICE = "/dev/ttyUSB0";
const BAUD_RATE = 9600;
const SERIAL_BUFFERSIZE = 10;

var PM10 = Math.random() * 10
var PM25 = Math.random() * 100


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
        properties: ['read', 'notify'],
        descriptors: [
            new bleno.Descriptor({
                uuid: '2901',
                value: 'Nofity message: "PM2.5;PM10" (ug/m2)'
            })
        ]
    });

    this._value = new Buffer(0);
};

ParticulateCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
        // this._value = new Buffer(JSON.stringify({
        //   'PM2.5' : PM25,
        //   'PM10' : PM10
        // ));
        this._value = new Buffer(PM25.toFixed(4) +
            ";" + PM10.toFixed(4))
    }

    console.log('ParticulateCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

ParticulateCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log('A client subscribed with maxValueSize ' + String(maxValueSize));
    this._updater = setInterval(function() {
        // start sensor for the specified time (30secs?) and wait for the value
        // --- ONLY FOR TESTING ---
        PM25 = Math.random() * 10
        PM10 = Math.random() * 100
        var measurement = new Buffer(PM25.toFixed(4) +
            ";" + PM10.toFixed(4))
        // --- ONLY FOR TESTING ---
        updateValueCallback(measurement)
    }, 10000)
}

ParticulateCharacteristic.prototype.onUnsubscribe = function() {
    console.log('A client unsubscribed!')
    clearInterval(this._updater)
}

util.inherits(ParticulateCharacteristic, BlenoCharacteristic);
module.exports = ParticulateCharacteristic;
