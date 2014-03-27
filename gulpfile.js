var gulp = require('gulp')
    , usemin = require('gulp-usemin')
    , uglify = require('gulp-uglify')
    , clean = require('gulp-clean')
    , minifyHtml = require('gulp-minify-html')
    , minifyCss = require('gulp-minify-css')
    , compass = require('gulp-compass')
    , header = require('gulp-header')
    , refresh = require('gulp-livereload')
    , jshint = require('gulp-jshint')
    , rev = require('gulp-rev')
    , lrserver = require('tiny-lr')()
    , express = require('express')
    , livereload = require('connect-livereload');

// Constants
var SERVER_PORT = 5000;
var LIVERELOAD_PORT = 35729;

// Header configuration
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Compilation tasks
gulp.task('clean:build', function() {
    return gulp.src('./build', { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('compass:build', function () {
    return gulp.src('./app/assets/stylesheets/*.scss')
        .pipe(compass({
            css: '.tmp/assets/stylesheets',
            sass: 'app/assets/stylesheets',
            image: 'app/assets/images'
        }))
        .on('error', function(err) {
            console.log(err.message);
        })
        .pipe(gulp.dest('./.tmp'))
        .pipe(refresh(lrserver));
});

gulp.task('lint', function() {
    return gulp.src('./app/assets/javascripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('compile', ['clean:build', 'compass:build', 'lint'], function() {
    var projectHeader = header(banner, { pkg : pkg } );
    
    gulp.src('./app/*.html')
        .pipe(usemin({
            css:          [minifyCss(), rev(), projectHeader],
            html:         [minifyHtml({ empty: true })],
            js:           [uglify(), rev(), projectHeader],
            js_libs:      [rev()]
        }))
        .pipe(gulp.dest('build/'));
});

// Serve tasks
gulp.task('reload:html', function () {
    return gulp.src('./app/*.html')
        .pipe(refresh(lrserver));
})

gulp.task('watch', function () {
    gulp.watch('app/assets/stylesheets/**/*.scss', ['compass:build']);
    gulp.watch('app/*.html', ['reload:html']);
});

gulp.task('serve:app', ['watch'], function() {
    var server = express();
    server.use(livereload({
      port: LIVERELOAD_PORT
    }));
    server.use(express.static('./.tmp'));
    server.use(express.static('./app'));
    server.listen(SERVER_PORT);

    lrserver.listen(LIVERELOAD_PORT);
});

gulp.task('serve:build', function() {
    var server = express();
    server.use(express.static('./build'));
    server.listen(SERVER_PORT);
});

gulp.task('default', ['compile']);
