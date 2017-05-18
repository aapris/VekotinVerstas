var bleno = require('bleno');

var SystemInformationService = require('./systeminformationservice');
// var DummyService = require('./dummyservice');
var ParticulateService = require('./particulateservice');

var systemInfoService = new SystemInformationService();
var particulateService = new ParticulateService();

// https://raspberrypi.stackexchange.com/a/53800
function getRpiSerial(){
    var fs = require('fs');
    var content = fs.readFileSync('/proc/cpuinfo', 'utf8');
    var cont_array = content.split("\n");
    var serial_line = cont_array[cont_array.length-2];
    var serial = serial_line.split(":");
    return serial[1].slice(1);
}
var serialNo = getRpiSerial();
var deviceName = 'rpi-air-' + serialNo.slice(-6);

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
    if (state === 'poweredOn') {
        bleno.startAdvertising(deviceName, [particulateService.uuid]);
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
            particulateService,
            systemInfoService
        ]);
    }
});
