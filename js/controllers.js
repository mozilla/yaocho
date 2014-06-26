'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  $scope.document = KitsuneCorpus.getDoc($routeParams.slug);
  $rootScope.ui.current = $scope.document;
}]);

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  if (!$routeParams.topic) {
    $rootScope.ui.backHidden = true;
  }

  $scope.topic = KitsuneCorpus.getTopic($routeParams.topic);
  $scope.subtopics = KitsuneCorpus.getSubTopics($routeParams.topic);
  $scope.documents = KitsuneCorpus.getTopicDocs($routeParams.topic);

  $rootScope.ui.current = $scope.topic;
}]);
