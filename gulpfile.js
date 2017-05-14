/* ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥
♥
♥					Gulp main file, to simple projects
♥
♥					@author ovictoraurelio
♥					@github http://github.com/ovictoraurelio
♥					@website http://victoraurelio.com
♥
♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ */

'use strict';
const os = require('os');
var gulp = require('gulp'),
		$ = require('gulp-load-plugins')(),
		browserSync = require('browser-sync'),
		htmlmin = require('gulp-htmlmin'),
		gulpJshint = require('gulp-jshint'),
		sass = require('gulp-sass'),
		gutil = require('gulp-util'),
		useref = require('gulp-useref'),
		uglify = require('gulp-uglify'),
		cleanCSS = require('gulp-clean-css'),
		liveReload = require('gulp-livereload'),
		gulpif = require('gulp-if');
var reload = browserSync.reload;

gulp.task('styles', function() {
	return gulp.src('app/styles/main.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('app/styles'))
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(gulpJshint())
    .pipe(gulpJshint.reporter('jshint-stylish'))
    .pipe(gulpJshint.reporter('fail'));
});

gulp.task('html', ['styles'], function () {
  var assets = useref({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', uglify())).on('error', gutil.log)
    .pipe($.if('*.css', cleanCSS({compatibility: 'ie8'})))
    .pipe(useref())
    .pipe($.if('*.html', htmlmin({collapseWhitespace: true, removeComments: true, empty: true, quotes: true,loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    server: 'dist'
  });
});

gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
