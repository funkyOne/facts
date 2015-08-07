// Retrieve
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');
var http = require('http');
var session = require('./creds').session;

const epicField = 'customfield_10006';
const apiHost = 'ppab.mplogic.co.uk';
const apiPort = 8089;
const apiBaseUrl = '/rest/api/2';

const lowerIssueBoundary = 500;
const upperIssueBoundary = 700;

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
//            db.close()
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

function storeByKey(db, key) {
    return new Promise(function (resolve, reject) {
        var collection = db.collection('issues');
        var url = apiBaseUrl + "/issue/" + key;
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

            var body = '';

            response.on('data', function (d) {
                body += d;
            });

            response.on('end', function () {
                var parsed = JSON.parse(body);

                if (response.statusCode === 200) {
                    process.stdout.write("done");
                    parsed._id=parsed.key;
                    collection.insert(parsed);
                }
                else {
                    var msg = response.statusCode + " " + (parsed.errorMessages && parsed.errorMessages[0]);
                    process.stdout.write(msg);
                    reject(msg);
                }
                process.stdout.write("\n");

                resolve(parsed)
            });
        })
    });
}

module.exports = {
    storeIssue: storeByKey
};