var yaochoMocks = angular.module('yaocho.mocks');


/* This is kind of like a Promise, but it calls the .then callbacks syncronously
 * and only works for immediate values.
 */
function mockPromise(value) {
  return {
    then: function(cb) {
      return cb(value);
    },
  };
};

var mockDocs = [
  {
   "id": 0,
   "title": "Document 1",
   "slug": "topic1-doc1",
   "locale": "en-US",
   "products": ["firefox-os"],
   "topics": ["topic1"],
  },
  {
   "id": 1,
   "title": "Document 2",
   "slug": "topic1-doc2",
   "locale": "en-US",
   "products": ["firefox-os"],
   "topics": ["topic1"],
  },
  {
   "id": 2,
   "title": "Document 3",
   "slug": "topic1-1-document1",
   "locale": "en-US",
   "products": ["firefox-os"],
   "topics": ["topic1-1"],
  }
];


yaochoMocks.service('MockKitsune', [function() {
  var docs =
  this.documents = {
    all: function(opts) {
      if (opts.product === 'firefox-os' && opts.topic === 'topic1') {
        return mockPromise([mockDocs[0], mockDocs[1]]);
      } else if (opts.product === 'firefox-os' && opts.topic == 'topic1-1') {
        return mockPromise([mockDocs[2]]);
      } else {
        throw new Error('Unmocked case: product=' + opts.product + ', topic=' + opts.topic);
      }
    },
    get: function(slug) {
      throw "documents.get Not Implemented";
    }
  };

  this.topics = {
    all: function(product) {
      expect(product).to.equal('firefox-os');
      return mockPromise([
        {
          "title": "Topic 1",
          "slug": "topic1",
          "parent": null,
        },
        {
          "title": "Topic 1.1",
          "slug": "topic1-1",
          "parent": 'topic1',
        },
        {
          "title": "Topic 1.2",
          "slug": "topic1-2",
          "parent": "topic1",
        },
      ]);
    },
    one: function(product, topic) {
      throw "topics.one Not Implemented";
    },
  };
}]);
