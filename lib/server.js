const net = require('net');
const through2 = require('through2');
const SecureSocket = require('./core/secureSocket');
const Cipher = require('./core/cipher');
const log = require('log4js');

class LSServer extends SecureSocket {
    constructor(password, listenAddr = {host: '0.0.0.0', port: 7488}) {
        super(Cipher.createCipher(password));
        this.listenAddr = listenAddr;
        this.logger = log.getLogger('LSServer');
        this.logger.level = process.env.NODE_ENV == 'debug';
    }

    trimAddress(addr) {
        return addr.trim()
            .replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f/g, '');
    }

    handleConnection(localConnection) {
        this.logger.info(`Accept connection: ${localConnection.remoteAddress}:${localConnection.remotePort}`);
        
        localConnection.on('error', (err) => {
            this.logger.error(`Remote connection error: ${err}`);
            localConnection.destroy();
        });
        try {
            (async () => {
                // 接收客户端的建立连接请求
                let chunk = await this.socketRead(localConnection);
                if (!chunk && chunk[0] !== 0x05) {
                    localConnection.destroy();
                    return;
                }
                this.logger.info(`Accept socks5 from client step1`);
                // 回应客户端，无须验证
                let err = await this.socketWrite(localConnection, Buffer.from([0x05, 0x00]));
                if (err) {
                    this.logger.error(`Write Data fail: ${err}`);
                    localConnection.destroy();
                }
                this.logger.info(`Send socks5 to client step2`);
                // 接收客户端发送的信息
                let message = await this.socketRead(localConnection);
    
                let remote = this.trimAddress(Buffer.from(message.slice(4, message.length - 2)).toString());
                let port = parseInt('0x' + Buffer.from(message.slice(message.length - 2).toString('hex')));
    
                // console.log(message);
                this.logger.info(`Accept remote: ${remote}, port: ${port} from client step3`);
    
                let remoteConnection = net.createConnection(port, remote, async () => {
                    let err = await this.socketWrite(localConnection, 
                                                     Buffer.from([0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
                    this.logger.info(`Send to client step 4`);
                    if (err) {
                        this.logger.err(`Step 4 fail${err}`);
                        localConnection.destroy();
                    }
    
                    remoteConnection.pipe(through2((chunk, enc, callback) => {
                        chunk = this.encodeBuffer(chunk);
                        callback(null, chunk);
                    })).pipe(localConnection);
    
                    localConnection.pipe(through2((chunk, enc, callback) => {
                        chunk = this.decodeBuffer(chunk);
                        callback(null, chunk);
                    })).pipe(remoteConnection);
                })
                remoteConnection.on('error', (err) => {
                    console.log(err);
                    this.logger.error(`Connect to ${remote}:${port} fail`);
                    localConnection.destroy();
                    remoteConnection.destroy();
                    return;
                })
    
            })();
        } catch(e) {
            console.log(e);
        }
    }

    listen() {
        let server = net.createServer(this.handleConnection.bind(this));
        server.on('error', (err) => {
            this.logger(`proxy error ${err}`);
            server.close();
        });

        server.listen(this.listenAddr.port, (err) => {
            this.logger.info(`proxy server start listen${this.listenAddr.port}`);
        })
    }
}

module.exports = LSServer;