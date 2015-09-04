class DocsCtrl {
    constructor($scope, $rootScope, $http, $sceDelegate, $sce) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;

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
}

DocsCtrl.$inject = ["$scope", "$rootScope", "$http", "$sceDelegate", "$sce"];
angular.module("p7").controller("DocsCtrl", DocsCtrl);