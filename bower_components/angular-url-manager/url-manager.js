/**
 * Helps keep the URLs DRY so that only a name is passed around
 * instead of hard-coding URLs like crazy.
 *
 * The URL manager needs to be configured with URL patterns.
 * Configure the provider with patterns by using the
 * addUrlPattern() method.
 *
 * app.config([urlManagerProvider, function(urlMangerProvider){
 *     urlManangerProvider
 *     .addUrlPattern('BookListView', '/books/', {
 *         templateUrl : '/partials/book_list.html',
 *         controller  : 'BookListCtrl'
 *     })
 *     .addUrlPattern('BookDetailView', '/books/:id/:slug', {
 *         templateUrl : '/partials/book_detail.html',
 *         controller  : 'BookDetailCtrl'
 *     });
 * }]);
 *
 */
angular.module('url.manager', ['ngRoute'])

.provider('urlManager', ['$routeProvider', function($routeProvider){
    var _this = this;
    _this.urlPatterns = {};
    _this.base_url = '';
    var base = document.querySelector('base');
    if(base){
        var url = base.getAttribute('href');
        if(url){
            // the base URL should end with a '/'
            // but this conflicts with the $router
            // whack it off!
            url = url.substring(0, url.length - 1);
            _this.base_url = url;
        }
    }
    this.addUrlPattern = function(viewname, urlpattern, config){
        _this.urlPatterns[viewname] = {url: _this.base_url + urlpattern, config: config};
        $routeProvider.when(urlpattern, config);
        return this;
    };
    this.otherwise = function(config){
        $routeProvider.otherwise(config);
    };
    /**
     * Given the view name and the associated
     * keyword arguments, returns a url associated
     * with that view name and resource
     */
    this.$get = function(){

        return {
            reverse: function(view, params){
                if(!view in _this.urlPatterns){
                    // handle this
                }
                return interpolate(_this.urlPatterns[view].url, params);
            }
        }
    }
    /**
     * Copied directly from the ngRoute source
     *
     * Given a string containing ':id' as keyword
     * identifiers and an object mapping names to values
     * this will return a string with params interpolated with
     * the string.
     *
     * For example:
     * >>> var string = '/books/:id/:slug',
     *     params = {id: 42, slug: 'the-adventures-of-fred-funnies'}
     * >>> interpolate(string, params);
     * '/books/42/the-adventures-of-fred-funnies'
     *
     */
    function interpolate(string, params) {
        var result = [];
        angular.forEach((string || '').split(':'), function (segment, i) {
            if (i === 0) {
                result.push(segment);
            } else {
                var segmentMatch = segment.match(/(\w+)(.*)/);
                var key = segmentMatch[1];
                result.push(params[key]);
                result.push(segmentMatch[2] || '');
                delete params[key];
            }
        });
        return result.join('');
    }
}])
/**
 * allows the use of a <url> tag
 *
 * Usage:
 * <alink view="<viewname" id="123" slug="coolest-slug-ever" text="Coolest Link Ever" />
 * This will replace the alink directive as an <a> tag with an href of the correctly
 * constructed url to the view with the name `viewname`
 *
 * For Example:
 * Assume a view with the name 'BookDetailView' has a configured url
 * pattern of: '/books/:id/:slug/'
 * Then creating a directive of:
 *     <alink view="BookDetailView" id="42" slug="the-adventures-of-fred-funnies" text="The Adventures of Fred Funnies"/>
 * will produce an output of:
 *     <a href="/books/42/the-adventures-of-fred-funnies/">The Adventures of Fred Funnies</a>
 *
 * It is also possible to pass in a object that contains the keyword arguments needed
 * to resolve the URL. For example:
 *     In the scope, book = {id: 42, slug: "the-adventures-of-fred-funnies", title: "The Adventures of Fred Funnies"}
 *     <alink view="BookDetailView" obj="book" text="The Adventures of Fred Funnies" />
 * will produce the same output of:
 *     <a href="/books/42/the-adventures-of-fred-funnies/">The Adventures of Fred Funnies</a>
 *
 */
.directive('alink', [ 'urlManager', function(urlManager){
    return {
        restrict: 'E',
        replace : true,
        scope: {
            obj: "="
        },
        template: "<a ng-href='{{ url }}'>{{ text }}</a>",
        link: function(scope, element, attrs){
            var params = {};
            if('obj' in attrs){
                params = scope.obj;
            }
            else{
                angular.forEach(attrs, function(value, key){
                    if(key !== 'view' && key !== 'text' && key !== 'class' && key.charAt(0) !== '$'){
                        params[key] = value;
                    }
                });
            }
            scope.text = attrs.text;
            scope.url = urlManager.reverse(attrs.view, params);
        }

    }
}]);
