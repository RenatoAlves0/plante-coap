const coap = require('coap')

let liga_desliga = '0'

post = () => {
    let msg = coap.request({
        host: '192.168.0.4',
        pathname: 'led',
        method: 'POST',
        // confirmable: true,
    })

    msg.write(liga_desliga)

    if (liga_desliga == '0') liga_desliga = '1'
    else liga_desliga = '0'

    msg.on('response', function (res) {
        console.log('\n');
        res.pipe(process.stdout)
        // res.on('end', function () {
        //     process.exit(0)
        // })
    })

    msg.end()
}

get = () => {

    let req = coap.request({
        host: '192.168.0.4',
        pathname: 'led',
        // observe: true
    })

    req.on('response', function (res) {
        console.log('\n')
        res.pipe(process.stdout)
    })
    req.end()
}

setInterval(() => {

    get()

    post()

}, 1000)