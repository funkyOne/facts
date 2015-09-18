class DocsCtrl {
    constructor($scope, $rootScope, $http, $sceDelegate, $sce, $modal) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;
        this.$modal = $modal;

        $http.get("/categories").success(data => {
            this.categories = data;
        });
    }

    makeTrusted(html){
        return this.$sceDelegate.trustAs(this.$sce.HTML, html);
    }

    selectCategory(category) {
        this.selectedCategory = category;

        this.$http.get(`/categories/${category.id}/facts`, {cache: true}).success(data => {
            this.facts = data;
        });
    }

    hide(fact) {
        fact.hidden = true;
        this.Facts.update(fact);
    }

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
            this.updateCategories();
        });
    };

    updateCategories(){
        this.categories = this.Facts.categories();
    }
}

DocsCtrl.$inject = ["$scope", "$rootScope", "$http", "$sceDelegate", "$sce", "$modal"];
angular.module("p7").controller("DocsCtrl", DocsCtrl);