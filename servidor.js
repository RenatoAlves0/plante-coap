const coap = require('coap')
const server = coap.createServer()
const NTP = require("ntp-time").Client
const client_ntp = new NTP("a.st1.ntp.br", 123, { timeout: 5000 })
const jsonexport = require('jsonexport')
fs = require('fs')
let dados = { chegada: undefined, delay_ms: undefined, jitter_ms: undefined }
let delay_anterior = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
let gravado = [false, false, false, false, false, false, false, false, false, false]
let array_dados = [[], [], [], [], [], [], [], [], [], []]

server.on('request', (req, res) => {
    let url = req.url.split('/')[1]
    console.log('Url: ' + url)
    // console.log('Tamanho Url: ' + Buffer.byteLength(url) + ' bytes')
    // console.log('Tamanho Mensagem: ' + Buffer.byteLength(req.payload) + ' bytes')
    dados = JSON.parse(Buffer.from(req.payload).toString())
    dados.envio = data_saida(dados.envio_s, dados.envio_us)

    client_ntp
        .syncTime()
        .then(async (time) => {
            dados.chegada = await time.transmitTimestamp.toString().split('.')[0]
            let envio = await new Date(parseInt(dados.envio))
            let chegada = await new Date(parseInt(dados.chegada))
            dados.delay_ms = await Math.abs(chegada - envio)
            if (delay_anterior[parseInt(url)] == -1)
                dados.jitter_ms = 0
            else
                dados.jitter_ms = await Math.abs(delay_anterior[parseInt(url)] - dados.delay_ms)
            delay_anterior[parseInt(url)] = await dados.delay_ms
            await dadosToFile(dados, parseInt(url))
        })

    // res.end('0')
})

server.listen(() => {
    console.log('Servidor COAP Online')
})

data_saida = (envio_s, envio_us) => {
    envio_s = envio_s.toString()
    envio_us = envio_us.toString()
    let qtd_zero = 6 - envio_us.length
    let qtd_ms = 3 - qtd_zero
    for (let i = 0; i < qtd_zero; i++)
        envio_s += '0'
    envio_s += envio_us.slice(0, qtd_ms)
    return envio_s
}

dadosToFile = async (dados, i) => {
    // console.log('i ===> ' + i)
    // console.log(dados)
    await array_dados[i].push(dados)
    if (dados.id >= 14 && !gravado[i]) {
        await jsonexport(array_dados[i], async (err, csv) => {
            if (err) return console.error(err)
            let arquivo = await csv
            await fs.writeFile('f16_' + i + '.csv', arquivo, async (err) => {
                if (err) return console.log(err)
                else gravado[i] = true
            })
        })
    }
}