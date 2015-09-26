'use strict';

const route = require('koa-route');
const thunkify = require('thunkify');
const db = require('../db');

function router(app) {
    app.use(route.get('/topics', function*() {
        let topics = yield db.topic.find({});

        this.body = topics;
    }));

    app.use(route.get('/topics/:id/facts', function*(id) {
        const facts = yield db.run(
            'select fact.* ' +
            'from fact ' +
            'join fact_topic fc ' +
            'on fact.id=fc.fact_id and fc.topic_id=$1 and is_deleted=false', [id]);

        this.body = facts;
    }));

    app.use(route.del('/topics/:id/facts', function*(id) {
        const factId = this.query.fact_id;
        yield db.fact_topic.update({fact_id: factId, topic_id: id, is_deleted: true});

        this.status = 200;
    }));

    app.use(route.del('/topics/:id/facts/reorder', function*(id) {
        const factId = this.query.fact_id;
        let before = true;
        let anchorId;

        if (this.query.before_id) {
            anchorId = this.query.before_id;
        }
        else {
            before = false;
            anchorId = this.query.after_id;
        }

        yield db.reoder_fact([factId, id, anchorId, before]);

        this.status = 200;
    }));
}

module.exports = router;