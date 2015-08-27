'use strict';


const session = require('./creds').session;
const request = require('request');
const async = require('async');

const epicField = 'customfield_10006';
const apiBaseUrl = 'http://ppab.mplogic.co.uk:8089/rest/api/2/';

const jql = 'http://ppab.mplogic.co.uk:8089/issues/?jql=created>=2015-12-22';

function getIssues(maxIssueKey) {
    let filterClause = '';
    if (maxIssueKey) {
        filterClause = `issueKey >= ${maxIssueKey}`;
    }

    const orderClause = `order by issueKey`;
    const jql = `${filterClause}${orderClause}`;

    return search(jql);
}

function search(jql) {
    return new Promise((resolve, reject)=> {
        let resourcePath = `search?maxResults=50&jql=${encodeURIComponent(jql)}`;

        request.get({
            url: `${apiBaseUrl}${resourcePath}`,
            json: true,
            headers: {
                'Authorization': 'Basic ' + session
            }
        }, (error, response, body)=> {

            if (response.statusCode !== 200) {
                let msg = response.statusCode + ' ' + (body.errorMessages && body.errorMessages[0]);
                reject(msg);
                return;
            }

            resolve(body.issues.map(toIssue));
        });
    });
}


function processIssues(project, issueStartKey, cb) {
    let filters =[];
    filters.push( `project=${project}`);

    if (issueStartKey) {
        filters.push( `id >= ${issueStartKey}`);
    }

    const orderClause = `order by id`;
    const jql = `${filters.join(' AND ')} ${orderClause}`;

    return processIssuesInt(jql, cb);
}

function processIssuesInt(jql, issueProcessor) {
    let queue = async.queue(issueProcessor, 10);

    batchedSearch(jql, issues => queue.push(issues));
}

function batchedSearch(jql, cb, startAt, batchSize) {

    startAt = startAt || 0;
    batchSize = batchSize || 50;

    let resourcePath = `search?maxResults=${batchSize}&startAt=${startAt}&jql=${encodeURIComponent(jql)}`;

    request.get({
        url: `${apiBaseUrl}${resourcePath}`,
        json: true,
        headers: {
            'Authorization': 'Basic ' + session
        }
    }, (error, response, body)=> {
        if (response.statusCode !== 200) {
            let msg = response.statusCode + ' ' + (body.errorMessages && body.errorMessages[0]);

            //throw msg;
            return;
        }

        console.log(`got items from ${body.startAt} to ${body.startAt + body.issues.length} `);

        let issues = body.issues.map(toIssue);

        cb(issues);

        let nextStartAt = body.startAt + body.maxResults;

        if (nextStartAt <= body.total) {

            console.log(`requesting next ${batchSize} items starting from ${body.startAt}`);
            batchedSearch(jql, cb, nextStartAt, batchSize);
        }
    });
}

function toIssue(jiraIssue) {
    return {
        'jira_id': jiraIssue.id,
        'epic_key': jiraIssue.fields.customfield_10006,
        'text': jiraIssue.fields.description,
        'title': jiraIssue.fields.summary,
        'key': jiraIssue.key
    };
}

function getIssue(key) {
    return new Promise((resolve, reject)=> {
        request.get({
            url: `${apiBaseUrl}issue/${key}`,
            json: true,
            headers: {
                'Authorization': 'Basic ' + session
            }
        }, (error, response, body)=> {

            if (response.statusCode !== 200) {

                let msg = response.statusCode + ' ' + (body.errorMessages && body.errorMessages[0]);
                reject(msg);
                return;
            }

            body._id = body.key;

            resolve(body);

        });
    });
}

module.exports = {
    getIssues: getIssues,
    getIssue: getIssue,
    processIssues: processIssues
};