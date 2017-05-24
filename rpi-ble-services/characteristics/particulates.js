var bleno = require('bleno');
var os = require('os');
var util = require('util');
var SerialPort = require('serialport');
var sds011 = require('../sensors/sds011');
const SDS011_BUFFERSIZE = 10;

var BlenoCharacteristic = bleno.Characteristic;

var ParticulateCharacteristic = function() {
    ParticulateCharacteristic.super_.call(this, {
        // uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10',
        uuid: '9ece1216-4ae7-4ff2-8600-cb9c7a46c1be',
        properties: ['read', 'notify'],
    });

    this._value = new Buffer(0);
    this._sds011 = sds011(SDS011_BUFFERSIZE);
};

ParticulateCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
        var avgs = this._sds011.getAvgs();
        // console.log(this._sds011)
        this._value = new Buffer(avgs.pm25.toFixed(4) +
            ";" + avgs.pm10.toFixed(4));
    }

    console.log('ParticulateCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

ParticulateCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log('A client subscribed to particulate notify!')

    function reduceCircBuffer(sensor, cb) {
        return function() {
            // --- ONLY FOR TESTING (sds011 not attached)---
            // PM25 = Math.random() * 10
            // PM10 = Math.random() * 100
            // var measurement = new Buffer(PM25.toFixed(4) +
            // ";" + PM10.toFixed(4))
            // --- ONLY FOR TESTING ---
            // console.log(sensor);
            var avgs = sensor.getAvgs();
            var payload = new Buffer(avgs.pm25.toFixed(4) +
                ";" + avgs.pm10.toFixed(4));
            cb(payload);
        }
    }

    this._updater = setInterval(reduceCircBuffer(this._sds011, updateValueCallback), 10000);
}

ParticulateCharacteristic.prototype.onUnsubscribe = function() {
    console.log('A client unsubscribed from particulate notify! Clearing updater.')
    clearInterval(this._updater)
}

util.inherits(ParticulateCharacteristic, BlenoCharacteristic);
module.exports = ParticulateCharacteristic;
