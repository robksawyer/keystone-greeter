var gulp = require('gulp'),
    gutil = require('gulp-util')

/* HTML
gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('build'))
})
*/
// Scripts
gulp.task('scripts', function() {
  var browserify = require('gulp-browserify'),
      reactify = require('reactify'),
      literalify = require('literalify'),
      rename = require('gulp-rename')

  return gulp.src('public/__greeter_statics/js/lib/react/jsx/app.js')
    .pipe(browserify({
      debug: true,
      extensions: ['.jsx', '.js', '.json'],
      transform: [reactify, literalify.configure({
        jquery: 'window.$',
        'react-bootstrap': 'window.ReactBootstrap',
        react: 'window.React',
        text: 'window.Text',
        lodash: 'window._'
      })]
    }))
    .on('error', function(err) {
      gutil.log(err.message)
    })
    .pipe(rename('client.js'))
    .pipe(gulp.dest('public/__greeter_statics/js'))
})

/* Styles
gulp.task('styles', function() {
  var stylus = require('gulp-stylus'),
      normalize = require('normalize'),
      rename = require('gulp-rename')

  return gulp.src('src/styles/index.styl')
    .pipe(stylus({
      use: ['nib', normalize.path + '/normalize']
    }))
    .pipe(rename('client.css'))
    .pipe(gulp.dest('build'))
})
*/
// Vendor scripts
gulp.task('vendor', function() {
  var concat = require('gulp-concat')

  gulp.src([
		'public/__greeter_statics/js/lib/jquery/jquery-2.1.1.min.js',
		'public/__greeter_statics/js/lib/bootstrap/bootstrap-3.2.0.min.js',
		'public/__greeter_statics/js/lib/bower_components/react/react-with-addons.js',
		'public/__greeter_statics/js/lib/bower_components/lodash/lodash.js',
		'public/__greeter_statics/js/lib/bower_components/react-bootstrap/react-bootstrap.js',
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/__greeter_statics/js'))
})

/* Webserver w/LiveReload
gulp.task('serve', ['default', 'watch'], function() {
  var express = require('express'),
      api = require('./api'),
      livereload = require('gulp-livereload'),
      watch = require('gulp-watch'),
      open = require('open')

  var port = process.env.port || 3000

  express()
    .use(api)
    .use(express.static('./build'))
    .use(function(req, res) {
      res.sendfile('./build/index.html')
    })
    .listen(port, function() {
      open('http://localhost:' + port)
    })

  gulp.src('build/**')
    .pipe(watch({
      name: 'build'
    }))
    .pipe(livereload())
})
*/
// Watch
gulp.task('watch', function() {
  gulp.watch('public/__greeter_statics/js/lib/react/jsx/**', ['scripts'])
  gulp.watch('public/__greeter_statics/js/lib/bower_components/**', ['vendor'])
})

gulp.task('default', [ 'scripts', 'vendor'])
