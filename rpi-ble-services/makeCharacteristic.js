var bleno = require('bleno');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

var MakeCharacteristic = function(opts, broker) {
    // console.log('char factory was called with ' + JSON.stringify(opts));

    // save options
    this._broker = broker;
    this._topic = opts.topic;

    // holds newest value received from MQTT
    this._value = new Buffer(0); // init as ''
    this._updateValueCb = null;

    // subscribe to the MQTT topic provided to update this._value on a new message
    // ...also fire notify cb if it exists
    this._broker.on('published', function(packet, client) {

        if (packet.topic === '/' + this._topic) { // TODO embetter
            // console.log(this._topic + ', got a new value: ' + packet.payload);
            this._value = packet.payload;
            // when no one is listening to notify updates, this._updateValueCb == null
            if (typeof(this._updateValueCb) === typeof(Function)) {
                // console.log('calling updateValueCallback');
                this._updateValueCb(this._value);
            }
        }
    }.bind(this));

    BlenoCharacteristic.call(this, {
        uuid: opts.UUID,
        properties: opts.properties,
        descriptors: new bleno.Descriptor({
            uuid: opts.descriptorUUID,
            value: opts.descriptorText
        }),
        onReadRequest: function(offset, callback) {
            console.log(this.uuid + ' - onReadRequest: value = ' +
                this._value.slice(offset, offset + bleno.mtu).toString()
            );
            callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
        },
        onSubscribe: function(maxValueSize, updateValueCallback) {
            console.log('A client subscribed to ' + this.uuid + ' notify with maxValueSize ' + String(maxValueSize));
            this._updateValueCb = updateValueCallback;
        },
        onUnsubscribe: function() {
            console.log('A client unsubscribed from ' + this.uuid + ' notify! Clearing callback.')
            this._updateValueCb = null;
        }
    });
};

util.inherits(MakeCharacteristic, BlenoCharacteristic);
module.exports = MakeCharacteristic;
