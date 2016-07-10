"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

angular.module("p7").service("Facts1", ["$q", "$http", function ($q, $http) {

    //var facts = JSON.parse(localStorage.getItem("facts")) || [];

    var facts = undefined; //JSON.parse(localStorage.getItem("facts")) || [];

    var req = $http.get("/facts").success(function (data) {
        facts = data;

        initialize();
    });

    var _categories = [];

    function initialize() {
        facts.forEach(addFactCats);
    }

    function add(fact) {
        fact.id = facts.length;
        var md = new Remarkable();
        fact.html = md.render(fact.text);
        facts[fact.id] = fact;
        addFactCats(fact);
    }

    function addFactCats(fact) {
        fact.categories && fact.categories.forEach(addCat);
    }

    function factsForCategory(cat) {
        return _.filter(facts, function (fact) {
            return fact.categories && _.includes(fact.categories, cat);
        });
    }

    function addCat(cat) {
        if (!_.includes(_categories, cat)) {
            _categories.push(cat);
        }
    }

    function persist() {
        $http.put("/facts", JSON.stringify(facts));
        //localStorage.setItem("facts", JSON.stringify(facts));
    }

    function getFact(id) {
        return _.findWhere(facts, { id: id });
    }

    var api = {
        initialized: req,
        all: function all() {
            return facts;
        },
        categories: function categories() {
            return _categories.map(function (cat) {
                return {
                    key: cat,
                    title: _.capitalize(cat),
                    facts: factsForCategory(cat)
                };
            });
        },
        add: function add(fact) {
            facts.push(fact);
            persist();
        },
        update: function update(fact) {
            var factIndex = _.findIndex(facts, { id: fact.id });

            facts.splice(factIndex, 1, fact);
        },
        remove: function remove(id) {
            facts[id].removed = true;
            persist();
        },
        deleteFact: function deleteFact(fact, category) {
            var f = getFact(fact.id);

            _.remove(f.categories, function (c) {
                return c === category.key;
            });
            persist();
        },
        reset: function reset() {
            facts = [];
            persist();
        },
        findCategories: function findCategories(text) {
            var re = new RegExp(text);

            return $q.when(_.filter(_categories, function (cat) {
                return re.test(cat);
            }));
        }
    };

    return api;
}]);

var FactService = (function () {
    function FactService($q, $http) {
        var _this = this;

        _classCallCheck(this, FactService);

        this.$q = $q;
        this.$http = $http;

        this.initialized = $http.get("/facts").success(function (data) {
            _this.categories = data;
        });
    }

    _createClass(FactService, [{
        key: "update",
        value: function update(fact) {
            return this.$http.put("/facts/" + fact.id, fact);
        }
    }, {
        key: "removeFactFromCategory",
        value: function removeFactFromCategory(fact, category) {
            var index = category.facts.findIndex(function (f) {
                return f.id === fact.id;
            });

            if (index === -1) {
                return;
            }

            category.facts.splice(index, 1);
            return this.$http["delete"]("/categories/" + category.id + "/facts", { params: { fact_id: fact.id } });
        }
    }]);

    return FactService;
})();

FactService.$inject = ["$q", "$http"];
angular.module("p7").service("Facts", FactService);
//# sourceMappingURL=db.js.map