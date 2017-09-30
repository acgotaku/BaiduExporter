const gulp = require('gulp')
const babelify = require('babelify')
const browserify = require('browserify')
const tap = require('gulp-tap')
const buffer = require('gulp-buffer')

const del = require('del')

const eslint = require('gulp-eslint')
const stylelint = require('gulp-stylelint')

const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const jsTargets = ['./src/js/**/*.js']
const jsEntries = ['./src/js/*.js']
const cssTargets = ['./src/css/*.scss']
const config = {
  errorHandler: function (err) {
    console.log(err.toString())
    this.emit('end')
  }
}

gulp.task('js', function () {
  return gulp.src(jsEntries)
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
    .pipe(sourcemaps.write('.'))

    .pipe(gulp.dest('dist/js/'))
})

gulp.task('css', function () {
  return gulp.src(cssTargets)
    .pipe(plumber(config.plumberConfig))
    .pipe(stylelint())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      precision: 3,
      includePaths: ['.']
    }))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 1 versions']
      }),
      cssnano({zindex: false})
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css/'))
})
gulp.task('build', ['js', 'css'])

gulp.task('clean', function () {
  return del([
    'dist'
  ])
})
gulp.task('watch', ['build'], function () {
  gulp.watch(jsTargets, ['js'])
  gulp.watch(cssTargets, ['css'])
})

gulp.task('default', ['watch'])
