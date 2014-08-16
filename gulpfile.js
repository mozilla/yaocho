var fs = require('fs.extra');
var path = require('path');

var acorn = require('acorn');
var acornWalk = require('acorn/util/walk');
var nomnom = require('nomnom');
var request = require('request');
var vinyl = require('vinyl');

var concat = require('gulp-concat');
var download = require('gulp-download');
var es = require('event-stream');
var gulp = require('gulp');
var header = require('gulp-header');
var htmlSrc = require('gulp-html-src');
var l10nExtract = require('gulp-l10n-extract');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rm = require('gulp-rm');
var rsvg = require('gulp-rsvg');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');

gulp.task('watch', ['build'], function() {
  gulp.watch('app/**/*', ['build']);
});

gulp.task('build.img.logo', function() {
  var sizes = [32, 60, 90, 120, 128, 256, 512];
  return es.merge.apply(null, sizes.map(function(size) {
    return gulp.src('./app/img/logo.svg')
      .pipe(rsvg({width: size, height: size}))
      .pipe(rename(function(path) {
        path.basename += '_' + size;
      }))
      .pipe(gulp.dest('./dist/img/'));
  }));
});

gulp.task('build.img', ['build.img.logo', 'build.img.copy', 'build.info'], function() {
  return gulp.src('./app/img/gear.svg')
    .pipe(rsvg())
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('build.img.copy', function() {
  return gulp.src('./app/img/loading.gif')
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('build.copy', function() {
  return es.merge(
    gulp.src('app/index.html')
      .pipe(htmlSrc())
      .pipe(gulp.dest('dist')),

    gulp.src('app/index.html')
      .pipe(htmlSrc({presets: 'css'}))
      .pipe(gulp.dest('dist')),

    gulp.src('app/partials/*')
      .pipe(gulp.dest('dist/partials/')),

    gulp.src(['app/index.html', 'app/manifest.webapp'])
      .pipe(gulp.dest('dist/'))
  );
});

gulp.task('build.info', ['build.copy'], function() {
  var manifest = JSON.parse(fs.readFileSync('app/manifest.webapp'));
  return gulp.src('app/partials/settings.html')
    .pipe(replace(/\$([A-Z]+)/g, function(orig, ident) {
      return manifest[ident.toLowerCase()] || orig;
    }))
    .pipe(gulp.dest('dist/partials/'));
});

gulp.task('package', ['build', 'l10n.get'], function() {
  gulp.src('dist/**/*')
    .pipe(zip('yaocho.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function() {
  gulp.src(['./dist/**/*', './yaocho.zip'], {read: false})
    .pipe(rm());
});

gulp.task('server', ['build'], function() {
  var args = nomnom
   .option('port', {default: 8000})
   .option('host', {default: 'localhost'})
   .parse();
  gulp.src('dist')
    .pipe(webserver({
      host: args.host,
      port: args.port,
      fallback: 'index.html',
    }));
});

gulp.task('dev', ['build', 'watch', 'server']);
gulp.task('build', ['build.copy', 'build.img']);
gulp.task('default', ['build']);

gulp.task('l10n.extract', function() {
  return gulp.src(['app/js/**/*.js', 'app/index.html', 'app/partials/**/*.html'])
    .pipe(l10nExtract('yaocho'))
    .pipe(gulp.dest('locale/templates/LC_MESSAGES/'));
});

// I stole this from Kitsune's list of languages.
var languages = [
  'ar', 'bg', 'bn-BD', 'bn-IN', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en-US',
  'es', 'eu', 'fa', 'fi', 'fr', 'he', 'hi-IN', 'hr', 'hu', 'id', 'it', 'ja',
  'km', 'ko', 'lt', 'ml', 'ne-NP', 'nl', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro',
  'ru', 'si', 'sk', 'sl', 'sq', 'sr-Cyrl', 'sv', 'ta', 'ta-LK', 'te', 'th',
  'tr', 'uk', 'vi', 'zh-CN', 'zh-TW',
];

gulp.task('l10n.get', function() {
  var kitsuneUrl = 'http://support.mozilla.org/{lang}/jsi18n-yaocho/';

  return es.readArray(languages)
    .pipe(es.through(function(lang) {
      var url = kitsuneUrl.replace('{lang}', lang);
      var file = new vinyl({
        path: lang + '.js',
        contents: request.get(url),
      });
      this.emit('data', file);
    }))
    .pipe(gulp.dest('dist/l10n'))
    .on('error', function(err) { console.error(err.stack); });
});

gulp.task('l10n', ['l10n.get', 'l10n.extract']);
