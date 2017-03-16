var bleno = require('bleno');

// var SystemInformationService = require('./systeminformationservice');
var DummyService = require('./dummyservice');

var dummyService = new DummyService();
var deviceName = 'rpi-air-henri'

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
    if (state === 'poweredOn') {
        bleno.startAdvertising(deviceName, [dummyService.uuid]);
    }
    else {
        console.log('state changed to other than poweredOn, stopping advertising');
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error) {

    console.log('on -> advertisingStart: ' +
        (error ? 'error ' + error : 'success')
    );

    if (!error) {
        bleno.setServices([
            dummyService
        ]);
    }
});
