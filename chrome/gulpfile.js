const gulp = require('gulp')
const babelify = require('babelify')
const browserify = require('browserify')
const tap = require('gulp-tap')
const buffer = require('gulp-buffer')
const eslint = require('gulp-eslint')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const jsTargets = ['./src/js/*.js', '!./src/js/_*']
const cssTargets = ['./src/scss/*.scss']
const config = {
  errorHandler: function (err) {
    console.log(err.toString())
    this.emit('end')
  }
}

gulp.task('js', function () {
  return gulp.src(jsTargets)
    .pipe(plumber(config.plumberConfig))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(tap(function (file) {
      console.log('bundling ' + file.path)
      // replace file contents with browserify's bundle stream
      file.contents = browserify(file.path, {debug: true}).transform(babelify, {presets: ['env']}).bundle().on('error', config.errorHandler)
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    // write sourcemaps
    .pipe(sourcemaps.write('./'))

    .pipe(gulp.dest('dist/js/'))
})

gulp.task('css', function () {
  return gulp.src(cssTargets)
    .pipe(plumber(config.plumberConfig))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js/'))
})
gulp.task('build', ['js'])

gulp.task('watch', ['build'], function () {
  gulp.watch(jsTargets, ['js'])
})

gulp.task('default', ['watch'])
