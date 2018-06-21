
var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    ngannotate = require('gulp-ng-annotate'),
    del = require('del'),
	gettext = require('gulp-angular-gettext'),
	extend = require('gulp-extend'),
	wrap = require('gulp-wrap');

	
//gettext	
gulp.task('pot', function () {
    return gulp.src(['./app/views/*.html', './app/scripts/*.js'])
        .pipe(gettext.extract('metathesis.pot', {
            // options to pass to angular-gettext-tools... 
        }))
        .pipe(gulp.dest('./po/'));
});
 
gulp.task('translate', function () {
    return gulp.src('po/*.po')
        .pipe(gettext.compile({
            // options to pass to angular-gettext-tools... 
            format: 'json'
        }))
        .pipe(gulp.dest('./app/scripts/translate/'));
});

gulp.task('transcompile', function() {
  return gulp.src('po/*.po') // Stream PO translation files.
    .pipe(gettext.compile({format: 'json'})) // Compile to json
    .pipe(extend('.tmp.json')) // use .json extension for gulp-wrap to load json content
    .pipe(wrap( // Build the translation module using gulp-wrap and lodash.template
      '\'use strict\';\n\n' +
	  '/* global angular:false */\n' +
      'angular.module(\'metathesisApp\').run([\'gettextCatalog\', function (gettextCatalog) {\n' +
      '/* jshint -W100,-W109 */\n' +
      '<% var langs = Object.keys(contents); var i = langs.length; while (i--) {' +
      'var lang = langs[i]; var translations = contents[lang]; %>'+
      '  gettextCatalog.setStrings(\'<%= lang %>\', <%= JSON.stringify(translations, undefined, 2) %>);\n'+
      '<% }; %>' +
      '/* jshint +W100,+W109 */\n' +
      '}]);'))
    .pipe(rename('gettext.catalog.js')) // Rename to final javascript filename
    .pipe(gulp.dest('./app/scripts/')); // output to "src/scripts" directory
});	
	
//jshint
gulp.task('jshint', function() {
  return gulp.src('app/scripts/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter(stylish));
});

gulp.task('usemin',['jshint'], function () {
  return gulp.src('./app/**/*.html')
      .pipe(usemin({
        css:[minifycss(),rev()],
        js: [ngannotate(),uglify(),rev()]
      }))
      .pipe(gulp.dest('dist/'));
});


// Images
gulp.task('imagemin', function() {
  return del(['dist/images']), gulp.src('app/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('copyfonts', ['clean'], function() {
   gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
   .pipe(gulp.dest('./dist/fonts'));
   gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
   .pipe(gulp.dest('./dist/fonts'));
});

// Watch
gulp.task('watch', ['browser-sync'], function() {

  // Watch .js files
  gulp.watch('{app/scripts/**/*.js,app/styles/**/*.css,app/**/*.html}', ['usemin']);
    
  // Watch image files
  gulp.watch('app/images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
   var files = [
      'app/**/*.html',
      'app/styles/*.css',
      'app/images/**/*.png',
      'app/scripts/*.js',
      'dist/**/*'
   ];

   browserSync.init(files, {
      server: {
         baseDir: "dist",
         index: "index.html"
      },
	  https: true
   });  
    
  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', browserSync.reload);
    
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('usemin', 'imagemin','copyfonts');
});