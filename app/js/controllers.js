'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentListCtrl', ['$scope', 'bindPromise', 'CachedKitsune',
function($scope, bindPromise, Kitsune) {
    bindPromise($scope, 'documents', Kitsune.documents.all());
}]);

yaocho.controller('DocumentCtrl', ['$scope', '$routeParams', 'bindPromise', 'CachedKitsune',
function($scope, $routeParams, bindPromise, Kitsune) {
    bindPromise($scope, 'document',  Kitsune.documents.get($routeParams.slug));
}]);
