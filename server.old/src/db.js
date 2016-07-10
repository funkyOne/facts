'use strict';

let massive = require('massive');
let pgConnection = require('./creds').pg_connection;
let coMassive = require('./co-massive');

module.exports = coMassive(massive.connectSync({connectionString: pgConnection}));