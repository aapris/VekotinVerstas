var SerialPort = require('serialport');
var CircularBuffer = require('circular-buffer');

const SERIAL_DEVICE = "/dev/ttyUSB0";
const BAUD_RATE = 9600;
const SERIAL_BUFFERSIZE = 10;


function sds011(bufferSize) {
    var port = new SerialPort(SERIAL_DEVICE, {
        baudRate: BAUD_RATE,
        // parser: SerialPort.parsers.delimiter()
        parser: SerialPort.parsers.byteLength(SERIAL_BUFFERSIZE)
    });
    var pm25Buf = new CircularBuffer(bufferSize);
    var pm10Buf = new CircularBuffer(bufferSize);

    port.on('open', () => {
        console.log('Opened serial port!')
    });
    port.on('error', (err) => {
        console.log('Serial port error: ', err.message);
    })
    port.on('data', (data) =>{
        PM25 = data.readIntLE(2, 2) / 10
        pm25Buf.enq(PM25);
        PM10 = data.readIntLE(4, 2) / 10
        pm10Buf.enq(PM10);
    });

    function circAvg(circBuf) {
        var sum = circBuf.toarray().reduce(function (a,b) { return a+b; });
        var len = circBuf.size();
        return sum / len;
    }

    return {
        port: port,
        pm25Buf: pm25Buf,
        pm10Buf: pm10Buf,
        getAvgs: function() {
            return {
                'pm10': circAvg(pm10Buf),
                'pm25': circAvg(pm25Buf)
            }
        }
    }
};

module.exports = sds011;
