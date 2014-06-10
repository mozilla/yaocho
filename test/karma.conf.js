module.exports = function(config){
  config.set({
    basePath : '../',

    files : [
      'app/bower_components/lodash/dist/lodash.js',

      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',

      'app/bower_components/angular-url-manager/url-manager.js',
      'app/bower_components/restangular/dist/restangular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',

      'app/js/**/*.js',
      'test/mocks/module.js',
      'test/mocks/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['mocha', 'chai'],

    browsers : ['Firefox'],

    plugins : [
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-chai',
            ],
  });
};
