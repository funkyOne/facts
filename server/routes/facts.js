var Promise = require('promise');
var express = require('express');
var router = express.Router();
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');
var path = require('path');
var datafile = path.join(__base, 'data.json');
var storeIssue = require('../import').storeIssue;
var mssql = require('node-sqlserver-unofficial');
var conn_str = "Driver={SQL Server Native Client 11.0};Server={(localdb)\\v11.0};Database={facts};Trusted_Connection={Yes};";



//file syste,
//router.get('/', function (req, res) {
//fs.readFile(datafile,{encoding:'utf8'}, function(err,data) {
//    if(err) {
//        res.sendStatus(500);
//        return console.log(err);
//    }
//
//    res.json(data);
//});

//res.sendFile(datafile, undefined, function (err) {
//    if (err) {
//        console.log(err);
//        res.status(err.status).end();
//    }
//    else {
//        console.log('Sent:', datafile);
//    }
//});
//}

//mongo
//router.get('/', function (req, res) {
//    MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
//        map(db)
//            .then(function (cats) {
//                res.send(cats);
//                db.close();
//            }, function (reason) {
//                res.send(reason);
//                db.close();
//            })
//    })
//});


function map(db) {

    return new Promise(function (resolve, reject) {
        var collection = db.collection('issues');

        collection.aggregate([{
            $match: {
                "fields.customfield_10006": {
                    $exists: true,
                    $ne: null
                }
            }
        }, {$project: {"epic": "$fields.customfield_10006", "key": 1, "html": "$fields.description"}}])
            .toArray(function (err, issues) {

                var promises = [];
                if (err) {
                    reject(err);
                    return;
                }

                var grouped = _.groupBy(issues, "epic");

                var categories = [];
                _.forEach(grouped, function (group, name) {
                    if (!name)
                        return;

                    console.log("epic - " + name);


                    var cat = {facts: group};

                    var epic = _.findWhere(issues, {key: name});

                    //epic doesn't exist
                    if (epic) {
                        cat.title = epic.summary;
                        categories.push(cat);
                    }
                    else {
                        var promise = storeIssue(db, name).then(function (issue) {
                            cat.title = issue.fields.summary;
                            categories.push(cat);
                        });

                        promises.push(promise);
                    }
                });


                Promise.all(promises).then(function () {
                    //resolve();
                    resolve(categories);
                });
            });
    })
}


router.get('/', function (req, res) {
    mssql.open(conn_str, function (err, new_conn) {
        var promises = [];

        promises.push(query(new_conn, "select * from fact where hidden=0"));
        promises.push(query(new_conn, "select * from category"));
        promises.push(query(new_conn, "select * from fact_category"));
        //promises.push(query(new_conn, "select * from fact_issue"));

        Promise.all(promises).then(function (results) {
            var facts = results[0];
            var categories = results[1];
            var fact_category = results[2];

            var facts_indexed = _.indexBy(facts, "id");

            var cat_ffacts = _.groupBy(fact_category, "category_id");

            _.forEach(categories, function (cat) {
                cat.facts = _.map(cat_ffacts[cat.id], (function (fc) {
                    return facts_indexed[fc.fact_id];
                }));
            });

            res.send(categories);
        }, function (err) {
            res.send(err);
        });
    });
});

router.get('/:id/issues', function (req, res) {

    mssql.open(conn_str, function (err, new_conn) {

        query(new_conn,"select * from fact_issue where fact_id=?", [req.params.id])
            .then(function (fact_issues) {


            MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
                if (err) {
                    res.send("err");
                    return;
                }

                var issueIds = _(fact_issues).pluck("issue_id").map(String).value();

                db.collection("issues").find({id: {$in: issueIds}})
                    .toArray(function (err, issues) {

                        if (err) {
                            res.send("err")
                        }

                        res.send(issues)
                    })
            })
        }, function (reason) {
            res.send(reason)
        });
    })
});


function singleQuery(conStr, sql, params) {
    return new Promise(function (resolve, reject) {
        mssql.query(conStr, sql, params, function (err, result) {
            if (err) {
                reject(err);
                return;
            }

            resolve(result)
        })
    })
}

function query(con, sql, params) {
    return new Promise(function (resolve, reject) {
        con.query(sql, params, function (err, result) {
            if (err) {
                reject(err);
                return;
            }

            resolve(result)
        })
    })
}


router.put('/:id', function (req, res, next) {
    if (!req.body) {
        res.sendStatus(400);
    }

    var factId = req.params.id;
    var fact = req.body;

    mssql.queryRaw(conn_str,"UPDATE fact SET text=?, html=?,hidden=? WHERE id=?",[fact.text,fact.html, fact.hidden, factId], function (err, result) {
        if(err)
        {
            res.sendStatus(500);
            console.log(err);
            return
        }

        res.sendStatus(200);
    });
});

module.exports = router;
