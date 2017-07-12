var bleno = require('bleno');
var makeBroker = require('./sensors/broker');
var fs = require('fs');
var GenericService = require('./makeService');

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

// Start creating services and save their promises
var services = [];
for (i in files) {
    // console.log('starting to create a service: ', files[i]);
    var service = new GenericService(SERVICE_CONF_PATH + files[i], broker);
    services.push(service);
}

// Now that all services have hopefully been created, start advertising and set services
// console.log('services have all been created. here is the first one: ' + services[0]);
console.log('bleno state == ' + bleno.state);

var serviceUUIDs = services.map(function (s) { return s.uuid; })

// INIT BLENO by subscribing to an adapter state change
// ...also attach callbacks for disconnections and advertising errors
bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
    if (state === 'poweredOn') {
        // console.log(deviceName, serviceUUIDs)
        // bleno.startAdvertising(deviceName, serviceUUIDs);
        bleno.startAdvertising(deviceName);
    }
    else {
        console.log('state changed to other than poweredOn, stopping advertising');
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error) {
    if (!error) {
        console.log('services are set');
        bleno.setServices(services);
    }
});

bleno.on('advertisingStartError', function(error) {
    console.log('Error starting advertising: ' + error);
    console.log('Restarting.');
    process.exit(0);
});

// problems with disconnecting, so we want to let pm2 take care of restarting on disconnect
bleno.on('disconnect', function(clientAddress) {
    console.log('Client ' + clientAddress + ' disconnected! Exiting for restart.');
    process.exit(0);
})
