'use strict';

// Retrieve
let MongoClient = require('mongodb').MongoClient;
let _ = require('lodash');
let http = require('http');
let session = require('./creds').session;

const epicField = 'customfield_10006';
const apiHost = 'ppab.mplogic.co.uk';
const apiPort = 8089;
const apiBaseUrl = '/rest/api/2';

const lowerIssueBoundary = 700;
const upperIssueBoundary = 950;

// Connect to the db
//MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
//    if (err) {
//        return console.dir(err);
//    }
//
//    var i = lowerIssueBoundary;
//
//    db.createCollection('issues', function (err, collection) {
//        storeNext().then(function () {
//            db.close();
//            console.log("done!");
//            process.exit();
//        })
//    });
//
//
//    function storeNext() {
//        return i <= upperIssueBoundary ? storeIssue(db, i++).then(storeNext, storeNext) : null;
//    }
//});

function storeIssue(db, i) {
    return storeByKey(db, "PPAB-" + i);
}

//http//ppab.mplogic.co.uk:8089/rest/api/2/issue/PPAB-901

//http://ppab.mplogic.co.uk:8089/rest/api/2/issue

function storeByKey(db, key) {
    return new Promise(function (resolve, reject) {
        let collection = db.collection('issues');
        let url = apiBaseUrl + "/issue/" + key;
        process.stdout.write(key+" ");

        http.get({
            host: apiHost,
            port: apiPort,
            path: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic '+session
            }
        }, function (response) {
            let body = '';

            response.on('data', function (d) {
                body += d;
            });

            response.on('end', function () {
                let parsed = JSON.parse(body);

                if (response.statusCode === 200) {
                    process.stdout.write("done");
                    parsed._id=parsed.key;
                    collection.insert(parsed);
                }
                else {
                    let msg = response.statusCode + " " + (parsed.errorMessages && parsed.errorMessages[0]);
                    process.stdout.write(msg);
                    reject(msg);
                }
                process.stdout.write("\n");

                resolve(parsed);
            });
        });
    });
}

module.exports = {
    storeIssue: storeByKey
};