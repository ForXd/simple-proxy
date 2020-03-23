class Cipher {
    constructor(encodePassword, decodePassword) {
        this.encodePassword = encodePassword.slice();
        this.decodePassword = decodePassword.slice();
    }

    decode(buffer) {
        return buffer.map((value, index) => this.decodePassword[value]);
    }

    encode(buffer) {
        return buffer.map((value, index) => this.encodePassword[value]);
    }
}

Cipher.createCipher = function(encodePassword) {
    if (typeof encodePassword == 'string') {
        encodePassword = Buffer.from(encodePassword, 'base64');
    }
    let decodePassword = Buffer.alloc(256);

    for (let i = 0; i < decodePassword.length; ++i) {
        let value = encodePassword[i];
        // value, offset
        decodePassword.writeUInt8(i, value);
    }

    return new Cipher(encodePassword, decodePassword);
}

module.exports = Cipher;