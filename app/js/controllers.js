'use strict';

var yaocho = angular.module('yaocho');

yaocho.controller('DocumentCtrl', ['$rootScope', '$scope', '$routeParams', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, KitsuneCorpus) {
  $scope.$watch('document', function(newDoc) {
    if (newDoc.title) {
      $rootScope.$emit('title.change', newDoc.title);
    }
  }, true);

  $scope.document = KitsuneCorpus.getDoc($routeParams.slug);
}]);

yaocho.controller('TopicBrowserCtrl', ['$rootScope', '$scope', '$routeParams', 'bindPromise', 'Kitsune', 'KitsuneCorpus',
function($rootScope, $scope, $routeParams, bindPromise, Kitsune, KitsuneCorpus) {
  $scope.$watch('topic', function(newTopic) {
    if (newTopic && newTopic.title) {
      $rootScope.$emit('title.change', newTopic.title);
    }
  }, true);

  $scope.topic = KitsuneCorpus.getTopic($routeParams.topic);
  $scope.subtopics = KitsuneCorpus.getSubTopics($routeParams.topic);
  $scope.documents = KitsuneCorpus.getTopicDocs($routeParams.topic);

  console.log('subtopics', $scope.subtopics);

  // var topicPath = $routeParams.topic || '';
  // $scope.topics = [];
  // $scope.documents = [];
  // $scope.topicPath = topicPath;
  //
  // var topicSlug;
  // if (topicPath === '') {
  //   topicSlug = null;
  // } else {
  //   topicSlug = topicPath.split('/').slice(-1)[0];
  // }
  //
  // if (topicSlug !== null) {
  //   bindPromise($scope, 'documents',  Kitsune.documents.all({
  //     product: $rootScope.settings.product.slug,
  //     topic: topicSlug,
  //   }));
  // }
  //
  // Kitsune.topics.all($rootScope.settings.product.slug)
  // .then(function(topics) {
  //   var topTopic;
  //   if (topicPath === '') {
  //     $rootScope.$emit('title.change', 'All Topics');
  //     $scope.topics = topics.filter(function(topic) {
  //       return topic.parent === null;
  //     });
  //     topTopic = {slug: ''};
  //   } else {
  //     var path = $rootScope.settings.product.slug + '/' + topicPath;
  //     topTopic = topics.filter(function(topic) { return topic.path = path; })[0];
  //     $rootScope.$emit('title.change', topTopic.title);
  //     $scope.topics = topics.filter(function(topic) { return topic.parent === topTopic.slug; });
  //   }
  //   return topTopic;
  // });

}]);
