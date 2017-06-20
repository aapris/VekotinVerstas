var bleno = require('bleno');
var makeBroker = require('./sensors/broker');
var fs = require('fs');
var Promise = require('bluebird');
var serviceMaker = Promise.promisify(require('./makeService'));

// Serial number for naming our box
// https://raspberrypi.stackexchange.com/a/53800
function getRpiSerial(){
    var content = fs.readFileSync('/proc/cpuinfo', 'utf8');
    var cont_array = content.split("\n");
    var serial_line = cont_array[cont_array.length-2];
    var serial = serial_line.split(":");
    return serial[1].slice(1);
}
var serialNo = getRpiSerial();
var deviceName = 'rpi-air-' + serialNo.slice(-6);

var broker = makeBroker(); //MQTT broker to read for incoming sensor data

// Trawl config path and generate services and characteristics
const SERVICE_CONF_PATH = '/etc/rpi-ble-services/';
var files = fs.readdirSync(SERVICE_CONF_PATH);

var services = [];
for (i in files) {
    serviceMaker(files[i], broker);
}

Promise.all(services).then(function(services) {
    console.log('services have all been created. here is the first one: ' + services[0]);
    var serviceUUIDs = services.map(function (s) { return s.uuid; })

    bleno.on('stateChange', function(state) {
        console.log('on -> stateChange: ' + state);
        if (state === 'poweredOn') {
            bleno.startAdvertising(deviceName, serviceUUIDs);
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
            bleno.setServices(services);
        }
    });

    // problems with disconnecting, so we want to let pm2 take care of restarting on disconnect
    bleno.on('disconnect', function(clientAddress) {
        console.log('Client ' + clientAddress + ' disconnected! Exiting for restart.');
        process.exit(0)
    })
});
