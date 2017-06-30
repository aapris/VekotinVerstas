var bleno = require('bleno');
var util = require('util');
var fs = require('fs');

var CharacteristicFromConfig = require('./makeCharacteristic');

function ServiceFromConfig(confFileFullPath, broker) {
    // console.log('service factory was called with ' + confFileFullPath)

    // -- 1. read options from file
    var opts = JSON.parse(fs.readFileSync(confFileFullPath));

    // -- 2. create chars using options
    var chars = []
    for (i in opts.characteristics) {
        var char = new CharacteristicFromConfig(opts.characteristics[i], broker);
        chars.push(char);
    }

    // -- 3. create service using chars from prev step
    // console.log('all chars created, first one here: ' + chars[0]);
    bleno.PrimaryService.call(this, {
        // uuid: '0d52fc21-90ae-400f-b630-8e17630367c2', // 0x181A, https://www.bluetooth.com/specifications/gatt/services
        // characteristics: opts.characteristics.map(CharacteristicFromConfig)
        uuid: opts.UUID,
        characteristics: chars
    });
};

util.inherits(ServiceFromConfig, bleno.PrimaryService);
module.exports = ServiceFromConfig;
