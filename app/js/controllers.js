'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  console.log('controller DocumentCtrl');
  $scope.$watch('document', function(newDoc) {
    if (newDoc.title) {
      $rootScope.$emit('title.change', newDoc.title);
    }
  }, true);

  $scope.document = KitsuneCorpus.getDoc($routeParams.slug);
}]);

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  console.log('controller TopicBrowserCtrl');
  $scope.$watch('topic', function(newTopic) {
    if (newTopic && newTopic.title) {
      $rootScope.$emit('title.change', newTopic.title);
    }
  }, true);

  setInterval(function() {
    console.log('subtopics:', $scope.subtopics);
  }, 10 * 1000);
  console.log('subtopics:', $scope.subtopics);

  $scope.topic = KitsuneCorpus.getTopic($routeParams.topic);
  $scope.subtopics = KitsuneCorpus.getSubTopics($routeParams.topic);
  $scope.documents = KitsuneCorpus.getTopicDocs($routeParams.topic);
}]);
