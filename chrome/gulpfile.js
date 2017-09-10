const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')

const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const jsTargets = ['./src/js/*.js']
const config = {
  errorHandler: function (err) {
    console.log(err.messageFormatted)
    this.emit('end')
  }
}
gulp.task('js', function () {
  return gulp.src(jsTargets)
    .pipe(babel({presets: ['env']}))
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
