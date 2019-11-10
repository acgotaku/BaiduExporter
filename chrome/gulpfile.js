const gulp = require('gulp')

const rollupEach = require('gulp-rollup-each')
const rollupBabel = require('rollup-plugin-babel')
const rollupResolve = require('rollup-plugin-node-resolve')
const rollupCommon = require('rollup-plugin-commonjs')

const del = require('del')
const gulpIf = require('gulp-if')

const eslint = require('gulp-eslint')
const stylelint = require('gulp-stylelint')

const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat')
const cleanCSS = require('gulp-clean-css')

const imagemin = require('gulp-imagemin')
const mozjpeg = require('imagemin-mozjpeg')
const pngquant = require('imagemin-pngquant')

const plumber = require('gulp-plumber')

const uglify = require('gulp-uglify')
const jsTargets = ['./src/js/**/*.js']
const jsEntries = ['./src/js/*.js']
const cssTargets = ['./src/css/**/*.scss']
const imageTargets = ['./src/img/**/*']
const copyTarget = ['./_locales/**/*', 'background.js', 'manifest.json']
const config = {
  plumberConfig: {
    errorHandler: function (err) {
      console.log(err.toString())
      this.emit('end')
    }
  },
  env: {
    dev: process.env.NODE_ENV === 'development',
    prod: process.env.NODE_ENV === 'production'
  }
}

function lintJS () {
  return gulp.src(jsTargets)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function lintCSS () {
  return gulp.src(cssTargets)
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
}

function js () {
  return gulp.src(jsEntries)
    .pipe(plumber(config.plumberConfig))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(rollupEach({
      isCache: true,
      plugins: [
        rollupBabel({
          presets: ['@babel/preset-env']
        }),
        rollupResolve({
          browser: true
        }),
        rollupCommon()
      ] },
    {
      format: 'iife'
    }
    ))
    .pipe(gulpIf(config.env.prod, uglify()))
    .pipe(gulp.dest('dist/js/'), { sourcemaps: config.env.dev })
}

function css () {
  return gulp.src(cssTargets)
    .pipe(plumber(config.plumberConfig))
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
    .pipe(sass({
      outputStyle: 'nested',
      precision: 3,
      includePaths: ['.']
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(concat('style.css'))
    .pipe(gulpIf(config.env.prod, cleanCSS()))
    .pipe(gulp.dest('dist/css/'), { sourcemaps: config.env.dev })
}

function img () {
  return gulp.src(imageTargets)
    .pipe(plumber(config.plumberConfig))
    .pipe(imagemin([
      pngquant(),
      mozjpeg(),
      imagemin.svgo()], {
      verbose: true
    }))
    .pipe(gulp.dest('dist/img/'))
}

function copy () {
  return gulp.src(copyTarget, { base: '.' })
    .pipe(gulp.dest('dist/'))
}

function clean () {
  return del([
    'dist/**/*'
  ])
}

function watch () {
  gulp.watch(copyTarget, copy)
  gulp.watch(jsTargets, js)
  gulp.watch(cssTargets, css)
}

const build = gulp.parallel(js, css, img, copy)
const serve = gulp.series(clean, build, watch)
const publish = gulp.series(clean, build)

exports.build = build
exports.serve = serve
exports.publish = publish
exports.lintJS = lintJS
exports.lintCSS = lintCSS
exports.clean = clean
