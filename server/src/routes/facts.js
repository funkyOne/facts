'use strict';

const route = require('koa-route');
const parse = require('co-body');
const thunkify = require('thunkify');
const thenifyAll = require('thenify-all');
const _ = require('lodash');
const db = require('../db');

const run = thunkify(db.run).bind(db);

let Fact = thenifyAll(db.fact, {}, ['find', 'save']);
let Category = thenifyAll(db.category, {}, ['find']);
let FactCategory = thenifyAll(db.fact_category, {}, ['find']);

function factsRouter(app) {

    app.use(route.get('/facts', function*() {
        let facts = yield Fact.find({});
        let categories = yield Category.find({});
        let factCategory = yield FactCategory.find({});

        let factsIndexed = _.indexBy(facts, f=>f.id);
        let cat_facts = _.groupBy(factCategory, c=> c.category_id);

        _.forEach(categories, function (cat) {
            cat.facts = _.map(cat_facts[cat.id], fc => factsIndexed[fc.fact_id]);
        });

        this.body = categories;
    }));

    app.use(route.get('/facts/:id/issues', function*(id) {
        let issues = yield run('select i.* from issue i join fact_issue fi on i.id=fi.issue_id and fi.fact_id=$1', [id]);

        this.body = issues;
    }));

    app.use(route.put('/facts/:id', function*(id) {
        const save = thunkify(db.fact.save).bind(db.fact);
        const fact = yield parse(this);
        yield save(fact);

        this.status = 200;
    }));
}

module.exports = factsRouter;