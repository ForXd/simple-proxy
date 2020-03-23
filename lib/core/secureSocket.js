class SecureSocket {
    constructor(cipher) {
        this.cipher = cipher;
    }

    encodeBuffer(chunk) {
        if (!chunk) return;
        let encode = this.cipher.encode(chunk);
        return encode;
    }


    decodeBuffer(chunk) {
        if (!chunk) return;
        let decode = this.cipher.decode(chunk);
        return decode;
    }

    socketWrite(socket, buffer) {
        return new Promise((resolve, reject) => {
            socket.write(this.encodeBuffer(buffer), (err) => {
                if (err) reject(err);
                resolve();
            })
        })
    }

    socketRead(socket) {
        return new Promise((resolve, reject) => {
            socket.once('readable', (err) => {
                if (err) reject(err);
                resolve(this.decodeBuffer(socket.read()));
            })
        })
    }
}

module.exports = SecureSocket;