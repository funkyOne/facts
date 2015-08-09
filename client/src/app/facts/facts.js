class FactsCtrl {
    constructor(Facts, $modal, $rootScope, $http) {
        this.Facts = Facts;
        this.$modal = $modal;
        this.$rootScope = $rootScope;
        this.$http = $http;

        this.updateCategories();
    }

    updateCategories(){
        this.categories = this.Facts.categories();
    }

    delete(fact, category) {
        this.Facts.deleteFact(fact, category);
        this.updateCategories();
    }

    getDetails(fact) {
        if (fact.issues) {
            return;
        }

        this.$http.get("/facts/" + fact.id + "/issues").success((issues)=> {
            fact.issues = issues;
        })
    }

    addFact () {
        var modalInstance = this.$modal.open({
            templateUrl: '/facts/add-fact.html',
            controller: 'AddFactCtrl',
            resolve: ["Facts"]
        });

        modalInstance.result.then(()=> {
            this.updateCategories();
        });
    };

    edit (fact) {
        var scope = this.$rootScope.$new();
        scope.fact = fact;

        var modalInstance = this.$modal.open({
            templateUrl: '/facts/edit-fact.html',
            controller: 'EditFactCtrl',
            resolve: ["Facts"],
            scope: scope
        });

        modalInstance.result.then(()=> {
            this.updateCategories();
        });
    };

    hide (fact){
        fact.hidden = true;
        this.Facts.update(fact);
    }
}
FactsCtrl.$inject = ["Facts", "$modal", "$rootScope", "$http"];
angular.module("p7").controller("FactsCtrl",FactsCtrl);