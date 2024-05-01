const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;

let cap = new Cap();
let device = Cap.findDevice('192.168.1.1'); // Replace with your network interface IP
let filter = 'tcp and dst port 80';
let bufSize = 10 * 1024 * 1024;
let buffer = Buffer.alloc(65535);

let linkType = cap.open(device, filter, bufSize, buffer);

cap.setMinBytes && cap.setMinBytes(0);

cap.on('packet', function(nbytes, trunc) {
    let ret = decoders.Ethernet(buffer);

    if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
        ret = decoders.IPV4(buffer, ret.offset);
        console.log('Source: ' + ret.info.srcaddr + ' Destination: ' + ret.info.dstaddr);

        if (ret.info.protocol === PROTOCOL.IP.TCP) {
            let datalen = ret.info.totallen - ret.hdrlen;
            ret = decoders.TCP(buffer, ret.offset);
            console.log('TCP Data Length: ' + datalen);
        }
    }
});

console.log('Listening on ' + device + ': ' + filter);
