'use strict';

let express = require('express');
let router = express.Router();
let MongoClient = require('mongodb').MongoClient;
let _ = require('lodash');
let storeIssue = require('../../src/import').storeIssue;

router.get('/', function (req, res) {
    let db = req.app.get('db');
    db.fact.find({}, function (err, facts) {
        err && console.error(err);

        db.category.find({}, function (err, categories) {
            err && console.error(err);

            db.fact_category.find({}, function (err, fact_category) {
                err && console.error(err);

                let factsIndexed = _.indexBy(facts, f=>f.id);
                let cat_facts = _.groupBy(fact_category, c=> c.category_id);

                _.forEach(categories, function (cat) {
                    cat.facts = _.map(cat_facts[cat.id], (function (fc) {
                        return factsIndexed[fc.fact_id];
                    }));
                });

                res.send(categories);
            });
        });
    });
});

router.put('/:id', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
    }

    let db = req.app.get('db');
    let factId = req.params.id;
    let fact = _.extend({id: factId}, req.body);

    db.fact.save(fact, (err, updated)=> {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.sendStatus(200);
    });
});

router.get('/:id/issues', function (req, res) {
    let db = req.app.get('db');
    let factId = req.params.id;

    db.run('select i.* from issue i join fact_issue fi on i.id=fi.issue_id and fi.fact_id=$1', [factId], function (err, issues) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        res.send(issues);
    });

    //db.fact_issue.find({fact_id: req.params.id}, (err, fact_issues) => {
    //    if (err) {
    //        res.send(err);
    //        return;
    //    }
    //
    //    MongoClient.connect('mongodb://localhost:27017/exampleDb', (err, db) => {
    //        if (err) {
    //            res.send(err);
    //            return;
    //        }
    //
    //        let issueIds = _(fact_issues).pluck('issue_id').map(String).value();
    //
    //        db.collection('issues').find({id: {$in: issueIds}})
    //            .toArray(function (err, issues) {
    //
    //                if (err) {
    //                    res.send('err')
    //                }
    //
    //                res.send(issues)
    //            })
    //    })
    //});
});


function map(db) {
    return new Promise(function (resolve, reject) {
        let collection = db.collection('issues');

        collection.aggregate([{
                $match: {
                    'fields.customfield_10006': {
                        $exists: true,
                        $ne: null
                    }
                }
            }, {$project: {'epic': '$fields.customfield_10006', 'key': 1, 'html': '$fields.description'}}])
            .toArray(function (err, issues) {

                let promises = [];
                if (err) {
                    reject(err);
                    return;
                }

                let grouped = _.groupBy(issues, 'epic');

                let categories = [];
                _.forEach(grouped, function (group, name) {
                    if (!name)
                        return;

                    console.log('epic - ' + name);


                    let cat = {facts: group};

                    let epic = _.findWhere(issues, {key: name});

                    //epic doesn't exist
                    if (epic) {
                        cat.title = epic.summary;
                        categories.push(cat);
                    }
                    else {
                        let promise = storeIssue(db, name).then(function (issue) {
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
    });
}


module.exports = router;
