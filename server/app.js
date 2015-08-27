'use strict';

require('./base-init');

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let pgConnection = require('./creds').pg_connection;
let issueSync = require('./issue-sync');

let routes = require('././index');
let facts = require('././facts');

let massive = require('massive');

let app = express();

let clientProjectRoot = path.join(__dirname,'../..', 'client');

let massiveInstance = massive.connectSync({connectionString : pgConnection});
app.set('db', massiveInstance);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(favicon(path.join(clientProjectRoot,'favicon.ico')));

app.use(express.static(path.join(clientProjectRoot,'dist')));
app.use('/bower_components',  express.static(path.join(clientProjectRoot,'bower_components')));


//app.use('/users', users);

app.use('/facts', facts);
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

issueSync.initialize();


module.exports = app;
