angular.module("p7").controller("EditFactCtrl", ($scope, $modalInstance, Facts) => {

    $scope.issueStates = [{title:"new", id:0},{title:"in progress", id:1}, {title:"testing", id:2}, {title:"done", id:3}];

    $scope.save = function () {
        var fact = _.clone($scope.fact);
        var md = new Remarkable();

        //fact.state = $scope.state;
        fact.html = md.render(fact.text);
        //fact.topics = _.pluck($scope.topics, "text");

        Facts.update(fact);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.loadTopics = function (topic) {
        return Facts.findTopics(topic);
    }
});