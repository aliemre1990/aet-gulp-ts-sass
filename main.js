const yargs = require('yargs');

const server = require('./server');
const configuration = require('./configuration');

var clientWatchMode = yargs.argv.clientWatchMode;
var clientProdMode = yargs.argv.clientProdMode;

server.initialize(clientProdMode, clientWatchMode);