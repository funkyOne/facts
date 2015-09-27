angular.module("p7").controller("AddFactCtrl", ($scope, $modalInstance, Facts) => {
    $scope.fact = {};
    $scope.topics = [];

    $scope.issueStates = [{title:"new", id:0},{title:"in-progress", id:1}, {title:"testing", id:2}, {title:"done", id:3}, {title:"broken",id:4}];
    $scope.save = function () {
        var fact = _.clone($scope.fact);
        var md = new Remarkable();

        fact.html = md.render(fact.text);
        //fact.topics = _.pluck($scope.topics, "text");

        Facts.add(fact);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.loadTopics = function (topic) {
        return Facts.findTopics(topic);
    }
});