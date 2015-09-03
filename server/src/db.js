'use strict';

let massive = require('massive');
let pgConnection = require('./creds').pg_connection;

module.exports = massive.connectSync({connectionString: pgConnection});