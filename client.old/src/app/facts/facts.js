class FactsCtrl {
    constructor(Facts, $modal, $rootScope, $http, $sceDelegate, $sce) {
        this.Facts = Facts;
        this.$modal = $modal;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;

        this.updateTopics();
    }

    updateTopics(){
        this.topics = this.Facts.topics();
    }

    delete(fact, topic) {
        this.Facts.deleteFact(fact, topic);
        this.updateTopics();
    }

    getDetails(fact) {
        if (fact.issues) {
            return;
        }

        this.$http.get("/facts/" + fact.id + "/issues").success((issues)=> {
            fact.issues = issues;
        })
    }

    makeTrusted(html){
        return this.$sceDelegate.trustAs(this.$sce.HTML, html);
    }

    addFact () {
        var modalInstance = this.$modal.open({
            templateUrl: '/facts/add-fact.html',
            controller: 'AddFactCtrl',
            resolve: ["Facts"]
        });

        modalInstance.result.then(()=> {
            this.updateTopics();
        });
    };

    edit (fact) {
        var scope = this.$rootScope.$new();
        scope.fact = fact;

        var modalInstance = this.$modal.open({
            templateUrl: '/facts/edit-fact.html',
            controller: 'EditFactCtrl',
            resolve: ["Facts"],
            scope: scope,
            size: "lg"
        });

        modalInstance.result.then(()=> {
            this.updateTopics();
        });
    };

    hide (fact){
        fact.hidden = true;
        this.Facts.update(fact);
    }
}
FactsCtrl.$inject = ["Facts", "$modal", "$rootScope", "$http", "$sceDelegate", "$sce"];
angular.module("p7").controller("FactsCtrl", FactsCtrl);