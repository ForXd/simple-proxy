const net = require('net');


// let server = net.createServer((socket) => {
    
//     socket.write('111');
// })

// server.listen(8000);

const server = net.createServer((c) => {
    // 'connection' listener.
    console.log(`${c.remoteAddress}:${c.remotePort}`)
    console.log('client connected');
    c.on('end', () => {
      console.log('client disconnected');
    });
    c.write('hello\r\n');
    c.pipe(c);
});
server.on('error', (err) => {
    throw err;
});
server.listen(8000, () => {
    console.log('server bound');
});