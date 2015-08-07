var mongoose = require('mongoose');

var textElementSchema = mongoose.Schema({
    order: Number,
    parentId: Number,
    factId: Number,
    children: Array,
    html: String,
    markdown: String
});

var factSchema = mongoose.Schema({
    text: String,
    state: Number,
    textElements: Array,
    issues: Array
});

var issueSchema = mongoose.Schema( {
    assignee: String,
    assigneeId:Number,
    facts: Array,
    state: Number,
    type: Number
});

var FactState = {
    mint: 1,
    inProgress: 2,
    done: 3
};

var section = {
    order: 1,
    textElements: [
        {
            parentId: 1,
            factId: undefined,
            html: "<b>text<b/>",
            markdown: "**text**"
        }
    ]
};

module.exports = {
    TextElement: mongoose.model('TextElement', textElementSchema),
    Fact : mongoose.model("Fact", factSchema),
    Issue: mongoose.model("Issue", issueSchema)
};

// documentation view

// get list of categories with facts ordered by ui

// get issues associated with  fact
// save fact + save issue
// reorder fact in category
// remove fact from one category


