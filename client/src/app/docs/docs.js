class DocsCtrl {
    constructor($scope, $rootScope, $http, $sceDelegate, $sce, $modal, $window, Facts) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;
        this.$modal = $modal;
        this.$window = $window;
        this.factService = Facts;

        this.factService.initialized.then(()=>{
            this.updateTopics();
            this.selectTopic(this.topics[0]);
        });
    }

    makeTrusted(html){
        return this.$sceDelegate.trustAs(this.$sce.HTML, html);
    }

    selectTopic(topic) {
        this.selectedTopic = topic;

        this.$http.get(`/topics/${topic.id}/facts`, {cache: true}).success(data => {
            this.facts = data;
        });
    }

    hide(fact) {
        fact.hidden = true;
        this.factService.update(fact);
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
            this.updateTopics();
        });
    };

    updateTopics(){
        this.topics = this.factService.topics;
    }

    removeFactFromTopic(fact, topic) {
        if (this.$window.confirm(`Are you sure you want to remove fact (${fact.id}) from ${topic.title}?`))
        {
            this.factService.removeFactFromTopic(fact, topic);
            this.updateTopics();
        }
    }
}

DocsCtrl.$inject = ["$scope", "$rootScope", "$http", "$sceDelegate", "$sce", "$modal", "$window", 'Facts'];
angular.module("p7").controller("DocsCtrl", DocsCtrl);