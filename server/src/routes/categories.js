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

function router(app) {
    app.use(route.get('/categories', function*() {
        let categories = yield Category.find({});

        this.body = categories;
    }));

    app.use(route.get('/categories/:id/facts', function*(id) {
        const facts = yield run(
            'select fact.* ' +
            'from fact ' +
            'join fact_category fc ' +
            'on fact.id=fc.fact_id and fc.category_id=$1',[id]);

        this.body = facts;
    }));

    //app.use(route.get('/facts/:id/issues', function*(id) {
    //    let issues = yield run('select i.* from issue i join fact_issue fi on i.id=fi.issue_id and fi.fact_id=$1', [id]);
    //
    //    this.body = issues;
    //}));
    //
    //app.use(route.put('/facts/:id', function*(id) {
    //    const save = thunkify(db.fact.save).bind(db.fact);
    //    const fact = yield parse(this);
    //    yield save(fact);
    //
    //    this.status = 200;
    //}));
}

module.exports = router;