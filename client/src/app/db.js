angular.module("p7")
    .service("Facts1", ["$q", "$http", function ($q, $http) {

        //var facts = JSON.parse(localStorage.getItem("facts")) || [];

        var facts = undefined;//JSON.parse(localStorage.getItem("facts")) || [];

        var req = $http.get("/facts").success(function (data) {
            facts = data;

            initialize();
        });

        var topics = [];

        function initialize() {
            facts.forEach(addFactTopics);
        }

        function add(fact) {
            fact.id = facts.length;
            var md = new Remarkable();
            fact.html = md.render(fact.text);
            facts[fact.id] = fact;
            addFactTopics(fact);
        }

        function addFactTopics(fact) {
            fact.topics && fact.topics.forEach(addTopic)
        }

        function factsForTopic(topic) {
            return _.filter(facts, function (fact) {
                return fact.topics && _.includes(fact.topics, topic);
            })
        }

        function addTopic(topic) {
            if (!_.includes(topics, topic)) {
                topics.push(topic);
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
            topics: function () {
                return topics.map(function (topic) {
                    return {
                        key: topic,
                        title: _.capitalize(topic),
                        facts: factsForTopic(topic)
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
            deleteFact: function (fact, topic) {
                var f = getFact(fact.id);

                _.remove(f.topics, function (c) {
                    return c === topic.key
                });
                persist();
            },
            reset: function () {
                facts = [];
                persist();
            },
            findTopics: function (text) {
                var re = new RegExp(text);

                return $q.when(_.filter(topics, function (topic) {
                    return re.test(topic);
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
            this.topics = data;
        });
    }

    update(fact) {
        return this.$http.put(`/facts/${fact.id}`, fact)
    }

    removeFactFromTopic(fact, topic) {
        var index = topic.facts.findIndex(f=> f.id === fact.id);

        if (index === -1) {
            return;
        }

        topic.facts.splice(index, 1);
        return this.$http.delete(`/topics/${topic.id}/facts`, {params: {fact_id: fact.id}});
    }
}

FactService.$inject = ["$q", "$http"];
angular.module("p7").service("Facts", FactService);