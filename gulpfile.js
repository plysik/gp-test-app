let gulp = require('gulp');
let less = require('gulp-less');
let path = require('path');

gulp.task('less', function () {
    return gulp.src('lib/site.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('lib/css'));
});
gulp.task('default', ['less']);