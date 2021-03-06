'use strict';

const route = require('koa-route');
const parse = require('co-body');

const _ = require('lodash');
const db = require('../db');

function factsRouter(app) {

    app.use(route.get('/facts', function*() {
        let facts = yield db.fact.find({});
        let topics = yield db.topic.find({});
        let factTopic = yield db.fact_topic.find({});

        let factsIndexed = _.indexBy(facts, f=>f.id);
        let cat_facts = _.groupBy(factTopic, c=> c.topic_id);

        _.forEach(topics, function (cat) {
            cat.facts = _.map(cat_facts[cat.id], fc => factsIndexed[fc.fact_id]);
        });

        this.body = topics;
    }));

    app.use(route.get('/facts/:id/issues', function*(id) {
        let issues = yield db.run('select i.* from issue i join fact_issue fi on i.id=fi.issue_id and fi.fact_id=$1', [id]);

        this.body = issues;
    }));

    app.use(route.put('/facts/:id', function*(id) {
        const fact = yield parse(this);
        yield db.fact.save(fact);

        this.status = 200;
    }));
}

module.exports = factsRouter;