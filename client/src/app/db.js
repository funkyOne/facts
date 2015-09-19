angular.module("p7")
    .service("Facts1", ["$q", "$http", function ($q, $http) {

        //var facts = JSON.parse(localStorage.getItem("facts")) || [];

        var facts = undefined;//JSON.parse(localStorage.getItem("facts")) || [];

        var req = $http.get("/facts").success(function (data) {
            facts = data;

            initialize();
        });

        var categories = [];

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
            fact.categories && fact.categories.forEach(addCat)
        }

        function factsForCategory(cat) {
            return _.filter(facts, function (fact) {
                return fact.categories && _.includes(fact.categories, cat);
            })
        }

        function addCat(cat) {
            if (!_.includes(categories, cat)) {
                categories.push(cat);
            }
        }

        function persist() {
            $http.put("/facts", JSON.stringify(facts));
            //localStorage.setItem("facts", JSON.stringify(facts));
        }

        function getFact(id) {
            return _.findWhere(facts, {id: id});
        }

        var api = {
            initialized: req,
            all: function () {
                return facts;
            },
            categories: function () {
                return categories.map(function (cat) {
                    return {
                        key: cat,
                        title: _.capitalize(cat),
                        facts: factsForCategory(cat)
                    }
                })
            },
            add: function (fact) {
                facts.push(fact);
                persist()
            },
            update: function (fact) {
                var factIndex = _.findIndex(facts, {id: fact.id});

                facts.splice(factIndex, 1, fact);
            },
            remove: function (id) {
                facts[id].removed = true;
                persist();
            },
            deleteFact: function (fact, category) {
                var f = getFact(fact.id);

                _.remove(f.categories, function (c) {
                    return c === category.key
                });
                persist();
            },
            reset: function () {
                facts = [];
                persist();
            },
            findCategories: function (text) {
                var re = new RegExp(text);

                return $q.when(_.filter(categories, function (cat) {
                    return re.test(cat);
                }))
            }
        };

        return api;
    }]);

class FactService {
    constructor($q, $http) {
        this.$q = $q;
        this.$http = $http;

        this.initialized = $http.get("/facts").success(data => {
            this.categories = data;
        });
    }

    update(fact) {
        return this.$http.put(`/facts/${fact.id}`, fact)
    }

    removeFactFromCategory(fact, category) {
        var index = category.facts.findIndex(f=> f.id === fact.id);

        if (index === -1) {
            return;
        }

        category.facts.splice(index, 1);
        return this.$http.delete(`/categories/${category.id}/facts`, {params: {fact_id: fact.id}});
    }
}

FactService.$inject = ["$q", "$http"];
angular.module("p7").service("Facts", FactService);