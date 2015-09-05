'use strict';

const route = require('koa-route');
const thunkify = require('thunkify');
const db = require('../db');

function router(app) {
    app.use(route.get('/categories', function*() {
        let categories = yield db.category.find({});

        this.body = categories;
    }));

    app.use(route.get('/categories/:id/facts', function*(id) {
        const facts = yield db.run(
            'select fact.* ' +
            'from fact ' +
            'join fact_category fc ' +
            'on fact.id=fc.fact_id and fc.category_id=$1',[id]);

        this.body = facts;
    }));
}

module.exports = router;