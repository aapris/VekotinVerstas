var bleno = require('bleno');
var os = require('os');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var DummyCharacteristic = function() {
    DummyCharacteristic.super_.call(this, {
        // uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10',
        uuid: '9ece1216-4ae7-4ff2-8600-cb9c7a46c1be',
        properties: ['read'],
    });

    this._value = new Buffer(0);
};

DummyCharacteristic.prototype.onReadRequest = function(offset, callback) {

    if(!offset) {
        this._value = new Buffer(JSON.stringify({
          'dummy' : os.uptime()
        }));
  }

  console.log('DummyCharacteristic - onReadRequest: value = ' +
    this._value.slice(offset, offset + bleno.mtu).toString()
  );

  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

util.inherits(DummyCharacteristic, BlenoCharacteristic);
module.exports = DummyCharacteristic;
