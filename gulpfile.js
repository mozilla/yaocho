var gulp = require('gulp');
var rsvg = require('gulp-rsvg');
var eventStream = require('event-stream');
var rename = require('gulp-rename');

gulp.task('img/logo', function() {
    var sizes = [32, 60, 90, 120, 128, 256, 512];
    return eventStream.merge.apply(null, sizes.map(function(size) {
        return gulp.src('./app/img/logo.svg')
            .pipe(rsvg({width: size, height: size}))
            .pipe(rename(function(path) {
                path.basename += '_' + size;
            }))
            .pipe(gulp.dest('./app/img/'));
    }));
});

gulp.task('build', ['img/logo']);
gulp.task('default', ['build']);
