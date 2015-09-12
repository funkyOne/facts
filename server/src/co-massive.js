'use strict';

const thunk = require('thunkify');
const thenifyAll = require('thenify-all');

const methods = [
    'run'
];

const tableMethods = ['find', 'save', 'update','findOne', 'insert'];

function thenifyTable(table) {
    return thenifyAll(table, {}, tableMethods);
}

function thenify(source, methods) {
    let result = {};

    methods.forEach(name => {
        if (!source[name]) return;

        result[name] = thunk(source[name]).bind(source);
    });

    return result;
}


function thenifyDb(db){

    let thenifiedDb = thenify(db, methods);

    for (let table of db.tables){
        thenifiedDb[table.name] = thenify(table, tableMethods);
    }

    return thenifiedDb;
}


module.exports = thenifyDb;