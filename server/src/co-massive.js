'use strict';

const thunk = require('thunkify');

const dbMethods = ['run'];
const tableMethods = ['find', 'save', 'update', 'findOne', 'insert'];

function thunkifyAll(source, methods) {
    let result = {};

    methods.forEach(name => {
        if (!source[name]) return;

        result[name] = thunk(source[name]).bind(source);
    });

    return result;
}

function thunkifyDb(db) {

    let thenifiedDb = thunkifyAll(db, dbMethods);

    for (let table of db.tables) {
        thenifiedDb[table.name] = thunkifyAll(table, tableMethods);
    }

    return thenifiedDb;
}


module.exports = thunkifyDb;