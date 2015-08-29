'use strict';

const Encoder = require('node-html-encoder').Encoder;
let PGPubsub = require('pg-pubsub');
let jira = require('./jira');
let massive = require('massive');
let pgConnection = require('./creds').pg_connection;
let db = massive.connectSync({connectionString: pgConnection});
let async = require('async');
let marked = require('marked');

let pubsubInstance = new PGPubsub(pgConnection);
let encoder = new Encoder('entity');

function initialize() {

    //add issue message handler
    pubsubInstance.addChannel('issue', msg => {
        db.issue.findOne(msg.id, (err, issue)=> {

            console.log(`processing issue ${issue.id} (${issue.key})`);

            convertIssue(issue, (err) => {
                if (err) {
                    console.log(`ERROR at processing ${issue.id} (${issue.key})`);
                    console.log(err);
                    console.log(`skipping the issue, will try to process on next run`);
                }
                else{
                    console.log(`issue ${issue.id} (${issue.key}) processed`);

                    db.issue.save({id: issue.id}, {processed: true}, (e,updated)=>{ });
                }
            });
        });
    });

    // process existing unprocessed issues
    db.issue.find({processed: false}, {columns: ['id']}, (err, issues)=> {

        if (err) {
            console.error(err);
        }

        issues.forEach(issue=> pubsubInstance.publish('issue', {id: issue.id}));
    });

    // schedule synchronization routine
    setInterval(sync, 30 * 60 * 1000);

    sync();
}

/**
 * converts issue to fact or category and saves
 * @param issue an issue to process
 * @param callback callback
 */
function convertIssue(issue, callback) {
    if (!issue.epic_key) {
        db.category.findOne({epic_key: issue.key}, (e, cat)=> {
            if (e) {
                callback(e);
            }

            if (cat) {
                callback();
            }
            else {
                db.category.insert({title: issue.title, epic_key: issue.key}, callback);
            }
        });
    }
    else {
        db.fact_issue.findOne({issue_id: issue.id}, (e, factIssue)=> {

            if (e) {
                callback(e);
            }

            if (factIssue) {
                addFactToCategory(factIssue.fact_id, issue.epic_key, callback);
            }
            else {
                db.fact.insert({text: issue.text, html: issue.text && marked(issue.text)}, (err, inserted) => {

                    if (err) {
                        callback(err);
                    }

                    async.parallel([
                        cb => {
                            db.fact_issue.insert({issue_id: issue.id, fact_id: inserted.id}, cb);
                        },
                        cb => {
                            addFactToCategory(inserted.id, issue.epic_key, cb);
                        }
                    ], callback);
                });
            }
        });
    }
}

function addFactToCategory(fact_id,epic_key, cb){
    db.category.findOne({epic_key: epic_key}, (e, category)=> {
        if (e) {
            cb(e);
            return;
        }

        if(!category)
        {
            cb(`couldn't find category associated with epic_key ${epic_key}`);
            return;
        }

        db.fact_category.insert({category_id: category.id, fact_id: fact_id}, cb);
    });
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

    db.run('select max(jira_id) from issue', undefined, (err, res)=> {
        if (err) {
            throw err;
        }

        let maxIssueId = res[0].max;
        const startId = maxIssueId ? maxIssueId + 1 : 0;
        jira.processIssues('PPAB', startId, (issue, cb)=> {
            db.issue.insert(issue, (e,inserted)=>{
                if(e)
                {                    throw e;
                }

                console.log(`saved issue ${inserted.id} (${issue.key})`);
                pubsubInstance.publish('issue', {id: inserted.id});
                cb();
            });
        });
    });
}

function saveIssue(issue) {
    return new Promise((resolve, reject)=> {
        db.issue.insert(issue, (err, inserted)=> {
            if (err) {
                reject(err);
                return;
            }

            resolve(inserted);
        });
    });
}

module.exports = {synchronize: sync, initialize: initialize};