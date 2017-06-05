var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var GenericCharacteristic = function(opts) {
    GenericCharacteristic.super_.call(this, {
        // uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10',
        // properties: ['read', 'notify'],
        // descriptors: [
        //     new bleno.Descriptor({
        //         uuid: '2901',
        //         value: 'Nofity message: "PM2.5;PM10" (ug/m2)'
        //     })
        // ]
        uuid: opts['uuid'],
        properties: opts['properties'],
    });

    this._value = new Buffer(0);
};

GenericCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
        var avgs = this._sds011.getAvgs();
        this._value = new Buffer(avgs.pm25.toFixed(4) +
            ";" + avgs.pm10.toFixed(4));
    }

    console.log('GenericCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

GenericCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log('A client subscribed to particulate notify with maxValueSize ' + String(maxValueSize));

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

GenericCharacteristic.prototype.onUnsubscribe = function() {
    console.log('A client unsubscribed from particulate notify! Clearing updater.')
    clearInterval(this._updater)
}

util.inherits(GenericCharacteristic, BlenoCharacteristic);
module.exports = GenericCharacteristic;