var fs = require('fs.extra');

var nomnom = require('nomnom');

var gulp = require('gulp');
var eventStream = require('event-stream');
var htmlSrc = require('gulp-html-src');
var rename = require('gulp-rename');
var rm = require('gulp-rm');
var rsvg = require('gulp-rsvg');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');

gulp.task('watch', ['build'], function() {
  gulp.watch('app/**/*', ['build']);
});

gulp.task('build.img.logo', function() {
  var sizes = [32, 60, 90, 120, 128, 256, 512];
  return eventStream.merge.apply(null, sizes.map(function(size) {
    return gulp.src('./app/img/logo.svg')
      .pipe(rsvg({width: size, height: size}))
      .pipe(rename(function(path) {
        path.basename += '_' + size;
      }))
      .pipe(gulp.dest('./dist/img/'));
  }));
});

gulp.task('build.img', ['build.img.logo'], function() {
  return gulp.src('./app/img/gear.svg')
    .pipe(rsvg())
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('build.copy', function() {
  return eventStream.merge(
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

gulp.task('package', ['build'], function() {
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
