const coap = require('coap')
const server = coap.createServer()

server.on('request', (req, res) => {
    console.log(req.url.split('/')[1]);
    console.log(Buffer.from(req.payload).toString() + '\n');
    res.end('0')
})

server.listen(() => {
})