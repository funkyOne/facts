'use strict';

/**
 * This module contains functions to import 
 */

const Encoder = require('node-html-encoder').Encoder;
const PGPubsub = require('pg-pubsub');
const jira = require('./jira');
const db = require('./db');
const co = require('co');
const async = require('async');
const marked = require('marked');
const pgConnection = require('./creds').pg_connection;
const pubsubInstance = new PGPubsub(pgConnection);
const encoder = new Encoder('entity');

const EpicIssueType = 6;

/**
 * Initializes the service
 * Start listening for new issues and imports all existing
 */
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
 * converts issue to fact or topic and saves
 * @param issue an issue to process
 */
function* convertIssue(issue) {
    if (issue.issue_type === EpicIssueType) {
        let cat = yield db.topic.findOne({epic_key: issue.key});
        if (cat) {
            return;
        }

        yield db.topic.insert({title: issue.title, epic_key: issue.key});
    }
    else {
        let factIssue = yield db.fact_issue.findOne({issue_id: issue.id});

        if (factIssue) {
            yield addFactToTopic(factIssue.fact_id, issue.epic_key);
        }
        else {
            let inserted = yield db.fact.insert({text: issue.text, html: issue.text && marked(issue.text)});

            yield db.fact_issue.insert({issue_id: issue.id, fact_id: inserted.id});
            yield addFactToTopic(inserted.id, issue.epic_key);
        }
    }
}

/**
 * Associate the fact with given epic
 * @param fact_id
 * @param epic_key
 */
function* addFactToTopic(fact_id, epic_key) {
    let topic = yield db.topic.findOne({epic_key: epic_key});

    if (!topic) {
        throw new Error(`couldn't find topic associated with epic_key ${epic_key}`);
    }

    yield db.fact_topic.insert({topic_id: topic.id, fact_id: fact_id});
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

/**
 * Queues all new issue from JIRA tasks storage to be imported into main database
 */
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