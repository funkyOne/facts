angular.module('p7', ["ngRoute", "ui.bootstrap", "ngTagsInput", 'ngSanitize'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
//     $locationProvider.html5Mode(true);

        $routeProvider.when('/facts', {
            templateUrl: '/app/templates/facts.tpl.html',
            controller: 'FactsCtrl',
            resolve: {
                facts: ['Facts', function (Facts) {
                    return Facts.initialized;
                }]
            }
        });

        $routeProvider.otherwise({redirectTo: '/facts'});
    }])

    .controller("FactsCtrl", ["$scope", "Facts", "$modal","$rootScope","$http", function ($scope, Facts, $modal, $rootScope, $http) {
        $scope.categories = Facts.categories();
        //$scope.reset = function () {
        //    Facts.reset();
        //    location.reload();
        //};

        $scope.delete = function (fact, category) {
            Facts.deleteFact(fact, category);
            $scope.categories = Facts.categories();
        };

        $scope.getDetails = function(fact){

            if (fact.issues)
            {return;}


            $http.get("/facts/"+fact.id+"/issues").success(function(issues){
                fact.issues = issues;
            })
        };

        $scope.view = "all";

        $scope.addFact = function () {

            var modalInstance = $modal.open({
                templateUrl: '/app/templates/add-fact.html',
                controller: 'AddFactCtrl',
                resolve: ["Facts"]
            });

            modalInstance.result.then(function () {
                $scope.categories = Facts.categories();
            });
        };

        $scope.edit = function (fact) {

            var scope = $rootScope.$new();
            scope.fact = fact;

            var modalInstance = $modal.open({
                templateUrl: '/app/templates/edit-fact.html',
                controller: 'EditFactCtrl',
                resolve: ["Facts"],
                scope:scope
            });

            modalInstance.result.then(function () {
                $scope.categories = Facts.categories();
            });
        };
    }
    ])
    .controller("AddFactCtrl", function ($scope, $modalInstance, Facts) {
        $scope.fact = {};
        $scope.categories = [];

        $scope.issueStates = [{title:"new", id:0},{title:"in-progress", id:1}, {title:"testing", id:2}, {title:"done", id:3}, {title:"broken",id:4}];
        $scope.save = function () {
            var fact = _.clone($scope.fact);
            var md = new Remarkable();

            fact.html = md.render(fact.text);
            //fact.categories = _.pluck($scope.categories, "text");

            Facts.add(fact);
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.loadCategories = function (cat) {
            return Facts.findCategories(cat);
        }
    })
    .controller("EditFactCtrl", function ($scope, $modalInstance, Facts) {

        $scope.issueStates = [{title:"new", id:0},{title:"in progress", id:1}, {title:"testing", id:2}, {title:"done", id:3}];

        $scope.save = function () {
            var fact = _.clone($scope.fact);
            var md = new Remarkable();

            //fact.state = $scope.state;
            fact.html = md.render(fact.text);
            //fact.categories = _.pluck($scope.categories, "text");

            Facts.update(fact);
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.loadCategories = function (cat) {
            return Facts.findCategories(cat);
        }
    })
    .directive("editor", function () {
        return {
            link: function (scope, element, attrs) {
                element.keypress(function (e) {
                    if (e.which == 13) {

                    }
                });
            }
        };
    })
;