'use strict';

//to initialize __dirname
require('./base-init');

const logger = require('koa-logger');
const serve = require('koa-static');
const mount = require('koa-mount');
const koa = require('koa');
const path = require('path');
const factRoutes = require('./routes/facts');
const categoryRoutes = require('./routes/categories');
let issueSync = require('./issue-sync');

const app = koa();
const clientProjectRoot = path.join(__dirname, '../..', 'client');

app.use(logger());
app.use(serve(path.join(clientProjectRoot, 'dist')));
app.use(mount('/bower_components', serve(path.join(clientProjectRoot, 'bower_components'))));

factRoutes(app);
categoryRoutes(app);

app.listen(3000, function () {
    console.log('Listening on port', 3000);
});

issueSync.initialize();