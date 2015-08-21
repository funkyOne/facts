//var sql = require('node-sqlserver-unofficial');
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');

var massive = require("massive");

var conn_str = "Driver={SQL Server Native Client 11.0};Server={(localdb)\\v11.0};Database={facts};Trusted_Connection={Yes};";



var pgString = 'postgres://facts_app:JuB8bNwFyyTePvhd@localhost:5432/facts';
var massiveDb = massive.connectSync({connectionString : pgString});



MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {

    var collection = db.collection('issues');

    collection.aggregate([{$project: {"epic_key": "$fields.customfield_10006", "key": 1, "text": "$fields.description", "id": 1,"title":"$fields.summary"}}])
        .toArray(function (err, issues) {

            function storeNext() {
                var issue = issues.pop();
                return issue ? saveIssue(issue).then(storeNext, storeNext) : Promise.resolve();
            }


            storeNext().then(function () {
                process.exit();
            });
        });
});


function saveIssue(issue) {
    return new Promise(function (resolve, reject) {

        massiveDb.issue.insert({id:issue.id,text: issue.text,title: issue.title,key: issue.key,epic_key: issue.epic_key, created_at:new Date(), updated_at:new Date()},
            function(err, inserted){

            if (err) {
                console.log(err);
                reject(err);
            }

            resolve()

        });

        //sql.queryRaw(conn_str, "INSERT INTO issue(id,text,title,[key],epic_key) VALUES(?,?,?,?,?)", [issue.id, issue.text, issue.title, issue.key, issue.epic_key], function (e, r) {
        //
        //
        //    if (e) {
        //        reject(e);
        //    }
        //
        //    resolve()
        //});
    })

}