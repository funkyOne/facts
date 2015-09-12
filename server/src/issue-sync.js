'use strict';

const Encoder = require('node-html-encoder').Encoder;
let PGPubsub = require('pg-pubsub');
let jira = require('./jira');
const db = require('./db');
const co = require('co');

let async = require('async');
let marked = require('marked');
let pgConnection = require('./creds').pg_connection;
let pubsubInstance = new PGPubsub(pgConnection);
let encoder = new Encoder('entity');

const EpicIssueType = 6;

function initialize() {

    //add issue message handler
    pubsubInstance.addChannel('issue', msg => {
        co(function* () {

            let issue = yield db.issue.findOne(msg.id);

            console.log(`processing issue ${issue.id} (${issue.key})`);

            try {
                yield convertIssue(issue);
                console.log(`issue ${issue.id} (${issue.key}) processed`);
                yield db.issue.save({id: issue.id}, {processed: true});
            }
            catch (err) {
                console.log(`ERROR at processing ${issue.id} (${issue.key})`);
                console.log(err);
                console.log(`skipping the issue, will try to process on next run`);
            }
        });
    });

    // process existing unprocessed issues
    co(function* () {
        let issues = yield db.issue.find({processed: false}, {columns: ['id']});

        issues.forEach(issue=> pubsubInstance.publish('issue', {id: issue.id}));
    });

// schedule synchronization routine
    setInterval(sync, 30 * 60 * 1000);

    sync();
}

/**
 * converts issue to fact or category and saves
 * @param issue an issue to process
 */
function* convertIssue(issue) {
    if (issue.issue_type === EpicIssueType) {
        let cat = yield db.category.findOne({epic_key: issue.key});
        if (cat) {
            return;
        }

        yield db.category.insert({title: issue.title, epic_key: issue.key});
    }
    else {

        let factIssue = yield db.fact_issue.findOne({issue_id: issue.id});

        if (factIssue) {
            yield addFactToCategory(factIssue.fact_id, issue.epic_key);
        }
        else {
            let inserted = yield db.fact.insert({text: issue.text, html: issue.text && marked(issue.text)});

            yield db.fact_issue.insert({issue_id: issue.id, fact_id: inserted.id});
            yield addFactToCategory(inserted.id, issue.epic_key);
        }
    }
}

function* addFactToCategory(fact_id, epic_key) {

    let category = yield db.category.findOne({epic_key: epic_key});

    if (!category) {
        throw new Error(`couldn't find category associated with epic_key ${epic_key}`);
    }

    yield db.fact_category.insert({category_id: category.id, fact_id: fact_id});
}

//undone
function saveIfNotExists(table, item, query, cb) {
    table.findOne(query(), (e, item)=> {
        if (item) {
            cb();

        }
        else {
            table.save(item, cb);
        }
    });
}

function sync() {
    console.log('syncing issues...');

    co(function*() {
        let res = yield db.run('select max(jira_id) from issue', undefined);
        let maxIssueId = res[0].max;
        const startId = maxIssueId ? maxIssueId + 1 : 0;
        jira.processIssues('PPAB', startId, (issue, cb)=> {
            co(function *() {
                let inserted = yield db.issue.insert(issue);
                console.log(`saved issue ${inserted.id} (${issue.key})`);
                pubsubInstance.publish('issue', {id: inserted.id});
                cb();
            });
        });
    });
}

module.exports = {
    synchronize: sync,
    initialize: initialize
};