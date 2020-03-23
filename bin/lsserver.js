const Server = require('../lib/server')
let config = require('../.lightsocks.json');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  let server = new Server(config.password, {host:'0.0.0.0', port:9999});
  server.listen();
  console.log(`Worker ${process.pid} started`);
}