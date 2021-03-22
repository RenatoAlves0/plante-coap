const coap = require('coap')
const server = coap.createServer()
const jsonexport = require('jsonexport')
fs = require('fs')
let dados = { chegada: undefined, delay_ms: undefined, jitter_ms: undefined }
let delay_anterior = -1
let gravado = false
let array_dados = []

server.on('request', (req, res) => {
    let url = req.url.split('/')[1]
    console.log('Url: ' + url)
    console.log('Tamanho Url: ' + Buffer.byteLength(url) + ' bytes')
    console.log('Tamanho Mensagem: ' + Buffer.byteLength(req.payload) + ' bytes')
    dados = JSON.parse(String(Buffer.from(req.payload)))
    if (dados.fim) {
        gravar()
        console.log(dados)
    }
    else {
        dados.chegada = String(new Date().getTime() / 1000)
        dados.chegada = data_format_ms(dados.chegada.split('.')[0], dados.chegada.split('.')[1])
        dados.envio = data_format_us(dados.s, dados.us)
        let envio = new Date(parseInt(dados.envio))
        let chegada = new Date(parseInt(dados.chegada))
        dados.delay_ms = chegada - envio
        if (dados.delay_ms < 0) dados.delay_ms = 0

        if (delay_anterior == -1)
            dados.jitter_ms = 0
        else
            dados.jitter_ms = Math.abs(delay_anterior - dados.delay_ms)
        delay_anterior = dados.delay_ms
        console.log(dados)
        array_dados.push(dados)
    }

    // res.end('0')
})

server.listen(() => {
    console.log('Servidor COAP Online')
})

data_format_ms = (s, us) => {
    s = String(s)
    us = String(us) == 'undefined' ? '000' : String(us)
    let qtd_zero = 3 - us.length
    for (let i = 0; i < qtd_zero; i++)
        s += '0'
    let qtd_ms = 3 - qtd_zero
    s += us.slice(0, qtd_ms)
    return s
}

data_format_us = (s, us) => {
    s = String(s)
    us = String(us) == 'undefined' ? '000' : String(us)
    let qtd_zero = 6 - us.length
    for (let i = 0; i < qtd_zero; i++)
        s += '0'
    let qtd_ms = 3 - qtd_zero
    s += us.slice(0, qtd_ms)
    return s
}

gravar = () => {
    jsonexport(array_dados, (err, csv) => {
        if (err) return console.error(err)
        let arquivo = csv
        fs.writeFile('exp2/C1000_3.csv', arquivo, (err) => {
            if (err) return console.log(err)
            else gravado = true
        })
    })
}