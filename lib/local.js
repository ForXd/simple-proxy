const net = require('net');
const Cipher = require('./core/cipher');
const SecureSocket = require('./core/secureSocket');
const through2 = require('through2');
const log = require('log4js');


class LSLocal extends SecureSocket {
    constructor(password, listenAddr, remoteAddr) {
        super(Cipher.createCipher(password));
        this.listenAddr = listenAddr || {host: '127.0.0.1', port: 7448};
        this.remoteAddr = remoteAddr || {host: '127.0.0.1', port: '*'};
        this.logger = log.getLogger('LSLocal');
        this.logger.level = process.env.NODE_ENV == 'debug';
    }

    handleConnection(localConnection) {
        let { host, port } = this.remoteAddr;
        this.logger.info(`Accept connection ${localConnection.remoteAddress} ${localConnection.remotePort}`);

        localConnection.on('error', (err) => {
            this.logger.error(`error: ${err}`);
            localConnection.destroy();
        });

        localConnection.on('close', () => {
            this.logger.info(`Connection end ${localConnection.remoteAddress} ${localConnection.remotePort}`)
        });

        let remoteConnection = net.createConnection(port, host, () => {
            localConnection.pipe(through2((chunk, enc, callback) => {
                chunk = this.encodeBuffer(chunk);
                callback(null, chunk);
            })).pipe(remoteConnection);

            remoteConnection.pipe(through2((chunk, enc, callback) => {
                chunk = this.decodeBuffer(chunk);
                callback(null, chunk);
            })).pipe(localConnection);
        });

        remoteConnection.on('error', (err) => {
            this.logger.error(`Connect to remote server ${this.remoteAddr.host}:${this.remoteAddr.port} fail`);
            remoteConnection.destroy();
            localConnection.destroy();
        })
    }

    listen() {
        let server = net.createServer(this.handleConnection.bind(this));
        server.listen(this.listenAddr.port, () => {
            this.logger.info(`Local server start on: ${this.listenAddr.host}`);
        });

        server.on('error', (err) => {
            this.logger.error(`Local server fail: ${err}`);
            server.close();
        })
    }
}

module.exports = LSLocal;