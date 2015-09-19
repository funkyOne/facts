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
            'on fact.id=fc.fact_id and fc.category_id=$1 and is_deleted=false',[id]);

        this.body = facts;
    }));


    app.use(route.del('/categories/:id/facts', function*(id) {
        const factId = this.query.fact_id;
        yield db.fact_category.update({fact_id: factId, category_id:id, is_deleted:true});

        this.status = 200;
    }));
}

module.exports = router;