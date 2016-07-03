"use strict";

angular.module('p7', ["ngRoute", "ui.bootstrap", "ngTagsInput", 'ngSanitize']).config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: '/docs/docs.html',
        controller: 'DocsCtrl as vm'
    });

    $routeProvider.when('/facts', {
        templateUrl: '/facts/facts.html',
        controller: 'FactsCtrl as vm',
        resolve: {
            facts: ['Facts', function (Facts) {
                return Facts.initialized;
            }]
        }
    });

    $routeProvider.otherwise({ redirectTo: '/' });
}]).directive("editor", function () {
    return {
        link: function link(scope, element, attrs) {
            element.keypress(function (e) {
                if (e.which == 13) {}
            });
        }
    };
});
//# sourceMappingURL=app.js.map