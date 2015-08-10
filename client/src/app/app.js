angular.module('p7', ["ngRoute", "ui.bootstrap", "ngTagsInput", 'ngSanitize'])
    .config(['$routeProvider', ($routeProvider) => {

        $routeProvider.when('/facts', {
            templateUrl: '/facts/facts.tpl.html',
            controller: 'FactsCtrl as vm',
            resolve: {
                facts: ['Facts', function (Facts) {
                    return Facts.initialized;
                }]
            }
        });

        $routeProvider.otherwise({redirectTo: '/facts'});
    }])

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