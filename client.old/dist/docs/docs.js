'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DocsCtrl = (function () {
    function DocsCtrl($scope, $rootScope, $http, $sceDelegate, $sce, $modal, $window, Facts) {
        var _this = this;

        _classCallCheck(this, DocsCtrl);

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$http = $http;
        this.$sceDelegate = $sceDelegate;
        this.$sce = $sce;
        this.$modal = $modal;
        this.$window = $window;
        this.factService = Facts;

        this.factService.initialized.then(function () {
            _this.updateCategories();
            _this.selectCategory(_this.categories[0]);
        });
    }

    _createClass(DocsCtrl, [{
        key: 'makeTrusted',
        value: function makeTrusted(html) {
            return this.$sceDelegate.trustAs(this.$sce.HTML, html);
        }
    }, {
        key: 'selectCategory',
        value: function selectCategory(category) {
            var _this2 = this;

            this.selectedCategory = category;

            this.$http.get('/categories/' + category.id + '/facts', { cache: true }).success(function (data) {
                _this2.facts = data;
            });
        }
    }, {
        key: 'hide',
        value: function hide(fact) {
            fact.hidden = true;
            this.factService.update(fact);
        }
    }, {
        key: 'edit',
        value: function edit(fact) {
            var _this3 = this;

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
                _this3.updateCategories();
            });
        }
    }, {
        key: 'updateCategories',
        value: function updateCategories() {
            this.categories = this.factService.categories;
        }
    }, {
        key: 'removeFactFromCategory',
        value: function removeFactFromCategory(fact, category) {
            if (this.$window.confirm('Are you sure you want to remove fact (' + fact.id + ') from ' + category.title + '?')) {
                this.factService.removeFactFromCategory(fact, category);
                this.updateCategories();
            }
        }
    }]);

    return DocsCtrl;
})();

DocsCtrl.$inject = ["$scope", "$rootScope", "$http", "$sceDelegate", "$sce", "$modal", "$window", 'Facts'];
angular.module("p7").controller("DocsCtrl", DocsCtrl);
//# sourceMappingURL=../docs/docs.js.map