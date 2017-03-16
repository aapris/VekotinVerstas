var bleno = require('bleno');
var util = require('util');

var DummyCharacteristic = require('./characteristics/dummy');

function DummyService() {

  bleno.PrimaryService.call(this, {
    // uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    uuid: '0d52fc21-90ae-400f-b630-8e17630367c2', // 0x181A, https://www.bluetooth.com/specifications/gatt/services
    characteristics: [
      new DummyCharacteristic(),
    ]
  });
};

util.inherits(DummyService, bleno.PrimaryService);
module.exports = DummyService;
