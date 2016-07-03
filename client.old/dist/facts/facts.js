"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FactsCtrl = (function () {
    function FactsCtrl(Facts, $modal, $rootScope, $http, $sceDelegate, $sce) {
        _classCallCheck(this, FactsCtrl);

        this.Facts = Facts;
        this.$modal = $modal;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;

        this.updateCategories();
    }

    _createClass(FactsCtrl, [{
        key: "updateCategories",
        value: function updateCategories() {
            this.categories = this.Facts.categories();
        }
    }, {
        key: "delete",
        value: function _delete(fact, category) {
            this.Facts.deleteFact(fact, category);
            this.updateCategories();
        }
    }, {
        key: "getDetails",
        value: function getDetails(fact) {
            if (fact.issues) {
                return;
            }

            this.$http.get("/facts/" + fact.id + "/issues").success(function (issues) {
                fact.issues = issues;
            });
        }
    }, {
        key: "makeTrusted",
        value: function makeTrusted(html) {
            return this.$sceDelegate.trustAs(this.$sce.HTML, html);
        }
    }, {
        key: "addFact",
        value: function addFact() {
            var _this = this;

            var modalInstance = this.$modal.open({
                templateUrl: '/facts/add-fact.html',
                controller: 'AddFactCtrl',
                resolve: ["Facts"]
            });

            modalInstance.result.then(function () {
                _this.updateCategories();
            });
        }
    }, {
        key: "edit",
        value: function edit(fact) {
            var _this2 = this;

            var scope = this.$rootScope.$new();
            scope.fact = fact;

            var modalInstance = this.$modal.open({
                templateUrl: '/facts/edit-fact.html',
                controller: 'EditFactCtrl',
                resolve: ["Facts"],
                scope: scope,
                size: "lg"
            });

            modalInstance.result.then(function () {
                _this2.updateCategories();
            });
        }
    }, {
        key: "hide",
        value: function hide(fact) {
            fact.hidden = true;
            this.Facts.update(fact);
        }
    }]);

    return FactsCtrl;
})();

FactsCtrl.$inject = ["Facts", "$modal", "$rootScope", "$http", "$sceDelegate", "$sce"];
angular.module("p7").controller("FactsCtrl", FactsCtrl);
//# sourceMappingURL=../facts/facts.js.map