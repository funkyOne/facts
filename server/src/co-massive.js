'use strict';

const thunk = require('thunkify');
const thenifyAll = require('thenify-all');

const methods = [
    'run'
];

function thenifyTable(table){
    return thenifyAll(table, {}, ['find', 'save', 'update']);
}

function thenifyDb(db){

    let thenifiedDb = {};

    for (let table of db.tables){

        thenifiedDb[table.name] = thenifyTable(table);
    }

    methods.forEach(function(name){
        if (!db[name]) return;

        thenifiedDb[name] = thunk(db[name]).bind(db);
    });

    return thenifiedDb;
}


module.exports = thenifyDb;