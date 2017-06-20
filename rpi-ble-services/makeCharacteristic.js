var bleno = require('bleno');
var util = require('util');
var Promise = require('bluebird');

var BlenoCharacteristic = bleno.Characteristic;

var CharacteristicFromConfig = function(opts, broker) {

    // save options
    this._broker = broker;
    this._topic = opts.topic;

    // have a stand in for notify cb
    this._notifyCallback = null;

    // holds newest value received from MQTT
    this._value = new Buffer(0); // init as ''

    // subscribe to the MQTT topic provided to update this._value on a new message
    // ...also fire notify cb if it exists
    broker.on('published', function(packet, client) {
        if (packet.topic == this._topic) {
            this._value = new Buffer(packet.payload);
            // when no one is listening to notify updates, this._notifyCallback == null
            if (typeof(this._notifyCallback) === typeof(Function)) {
                this._notifyCallback(this._value);
            }
        }
    });

    CharacteristicFromConfig.super_.call(this, {
        uuid: opts.UUID,
        properties: opts.properties,
        descriptors: new bleno.Descriptor({
            uuid: opts.descriptorUUID,
            value: opts.descriptorText
        })
    });

};

// just "return" this._value, which always has the newest value from MQTT
CharacteristicFromConfig.prototype.onReadRequest = function(offset, callback) {
    console.log(this.uuid + ' - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );
    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

// save the cb, it will be called each time a new value arrives from MQTT
CharacteristicFromConfig.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log('A client subscribed to ' + this.uuid + ' notify with maxValueSize ' + String(maxValueSize));
    this._notifyCallback = updateValueCallback;
}
CharacteristicFromConfig.prototype.onUnsubscribe = function() {
    console.log('A client unsubscribed from ' + this.uuid + ' notify! Clearing callback.')
    this._notifyCallback = null;
}

util.inherits(CharacteristicFromConfig, BlenoCharacteristic);
module.exports = CharacteristicFromConfig;
