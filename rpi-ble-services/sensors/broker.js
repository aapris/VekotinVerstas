var mosca = require('mosca');

var ascoltatore = {
    type: 'redis',
    redis: require('redis'),
    db: 12,
    port: 6379,
    //return_buffers: true, // binary payloads
    host: "localhost"
};

var moscaSettings = {
    port: 1883,
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Redis
    }
};

function setup() {
    console.log('Mosca mqtt broker up and running!');
}

function makeMQTTBroker() {
    var server = new mosca.Server(moscaSettings);

    server.on('ready', setup);

    server.on('clientConnected', function(client) {
        console.log('sensor mqtt-client connected', client.id);
    });

    return server;
}

module.exports = makeMQTTBroker;
