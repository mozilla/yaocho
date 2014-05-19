'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentListCtrl', ['$scope', 'Kitsune',
function($scope, Kitsune) {
    $scope.documents = Kitsune.all('kb/documents').getList().$object;
}]);

yaocho.controller('DocumentCtrl', ['$scope', '$routeParams', 'Kitsune',
function($scope, $routeParams, Kitsune) {
    $scope.document = Kitsune.one('kb/documents', $routeParams.slug).get().$object;
}]);
