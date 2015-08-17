/**
 * Created by lega on 8/12/2015.
 */
var Sequelize = require("sequelize");
var pg_connection = require("./creds").pg_connection;
var _ = require("lodash");


var sequelize = new Sequelize(pg_connection);

var d = sequelize.define;

sequelize.define = function(name,def,opts){
    _.forEach(def,function(column,colName){
        column.field = _.snakeCase(colName);
    });

    opts = opts||{};

    opts.underscored = true;
    opts.underscoredAll = true;

    return d.call(this,name,def,opts);
};

var Fact = sequelize.define('fact', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    text: {
        type: Sequelize.TEXT
    },
    html: {
        type: Sequelize.TEXT
    },
    hidden: {
        type: Sequelize.BOOLEAN
    }
});


var Category = sequelize.define('category', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    title: {
        type: Sequelize.TEXT
    },
    epicKey: {
        type:Sequelize.STRING(10)
    }
});

//var FactCategory = sequelize.define('fact_category', {});

//    fact_id: {
//        type: Sequelize.INTEGER,
//        primaryKey: true,
//        //references: {
//        //    model: Fact,
//        //    key: 'id',
//        //    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
//        //}
//    },
//    category_id: {
//        type: Sequelize.INTEGER,
//        primaryKey: true,
//        //references: {
//        //    model: Category,
//        //    key: 'id',
//        //    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
//        //}
//    }
//}, {
//    underscored: true,
//    freezeTableName: true // Model tableName will be the same as the model name
//});

Category.belongsToMany(Fact, {through: 'fact_category'});
Fact.belongsToMany(Category, {through: 'fact_category'});


//FactCategory.belongsTo(Fact);
//
//FactCategory.belongsTo(Category);

var Issue = sequelize.define('issue', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    text: {
        type: Sequelize.TEXT
    },
    title: {
        type: Sequelize.TEXT
    },
    key:{
        type:Sequelize.STRING(10)
    },
    epicKey:{
        type:Sequelize.STRING(10)
    }

});


//var FactIssue = sequelize.define('fact_issue', {
//    fact_id: {
//        type: Sequelize.INTEGER,
//        primaryKey: true,
//        references: {
//            model: Fact,
//            key: 'id',
//            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
//        }
//    },
//    issue_id: {
//        type: Sequelize.INTEGER,
//        primaryKey: true,
//        references: {
//            model: Issue,
//            key: 'id',
//            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
//        }
//    }
//}, {
//    freezeTableName: true // Model tableName will be the same as the model name
//});


Issue.belongsToMany(Fact, {through: "fact_issue"});
Fact.belongsToMany(Issue, {through: "fact_issue"});

sequelize.sync();

//Fact.sync({force: true}).then(function () {
//    return Category.sync({force:true});
//}).then(function(){
//    return Issue.sync({force:true});
//})
//    .then(function(){
//    return s.sync({force:true});
//})
//    .then(function(){
//    return FactCategory.sync({force:true});
//})
;

module.exports.Issue = Issue;
module.errors.Fact = Fact;