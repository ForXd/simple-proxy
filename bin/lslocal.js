const Local =  require('../lib/local');
let config = require('../.lightsocks.json');

let local = new Local(config.password, 
    {host: '127.0.0.1', port: 8080}, 
    {host: '127.0.0.1', port: 9999});

local.listen();