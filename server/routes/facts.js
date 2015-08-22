var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');
var path = require('path');
var storeIssue = require('../import').storeIssue;

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
    var db = req.app.get("db");
    db.fact.find({}, function (err, facts) {
        err && console.error(err);

        db.category.find({}, function (err, categories) {
            err && console.error(err);

            db.fact_category.find({}, function (err, fact_category) {
                err && console.error(err);

                var facts_indexed = _.indexBy(facts, "id");

                var cat_ffacts = _.groupBy(fact_category, "category_id");

                _.forEach(categories, function (cat) {
                    cat.facts = _.map(cat_ffacts[cat.id], (function (fc) {
                        return facts_indexed[fc.fact_id];
                    }));
                });

                res.send(categories);
            });
        });
    });
});

router.get('/:id/issues', function (req, res) {
    var db = req.app.get("db");

    db.fact_issue.find({fact_id: req.params.id}, (err, fact_issues) => {
        if (err) {
            res.send(err);
            return;
        }

        MongoClient.connect("mongodb://localhost:27017/exampleDb", (err, db) => {
            if (err) {
                res.send(err);
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
    });
});

router.put('/:id', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
    }

    var db = req.app.get("db");
    var factId = req.params.id;
    var fact = _.extend({id: factId}, req.body);

    db.fact.save(fact, (err, updated)=> {
        if (err) {
            res.send(err);
        }

        res.sendStatus(200);
    });
});

module.exports = router;
