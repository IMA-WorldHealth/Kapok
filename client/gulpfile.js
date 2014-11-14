var gulp = require('gulp'),
    // notify  = require('gulp-notify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint');

var jshintrcPath = '../.jshintrc';

var paths = {
  scripts : ['src/js/define.js', 'src/**/*.js', '!src/js/app.js'],
  // FIXME You shouldn't need src/partials/**/**/*.css
  styles : ['src/partials/**/*.css', 'src/partials/**/**/*.css', 'src/css/*.css', '!src/css/*.min.css', 'src/css/grid/*.css'],
  assets : ['src/assets/**/*'],
  static : ['src/index.html', 'src/login.html', 'src/error.html', 'src/project.html', 'src/js/app.js', 'src/i18n/*', 'src/css/fonts/*', 'src/partials/**/*.html', 'src/css/images/*'],
  vendor : ['vendor/angular/*', 'vendor/angular-translate/*', 'vendor/*.js'],
  jqueryui : ['vendor/jquery-ui/*.js'],
  slickgrid : ['vendor/SlickGrid/*.js', 'vendor/SlickGrid/plugins/*.js']
};

var destPath = 'dest/';

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    // .pipe(jshint(jshintrcPath))
    // .pipe(jshint.reporter('default'))
    //.pipe(uglify())
    .pipe(concat('js/bhima.min.js'))
    .pipe(gulp.dest(destPath));
    //.pipe(notify({ message : 'Completed compiling scripts.' }));
});

// TODO Remove minification of other vendors CSS, only minify and compile bhima CSS
gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(minifycss())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest(destPath + 'css/'));
    //.pipe(notify({ message : 'Completed compliling styles.' }));
});

// TODO Not all assets will be images, this will have to be more specific
gulp.task('assets', function () {
  return gulp.src(paths.assets)
    // .pipe(imagemin({ optimizationLevel : 3, progressive : true, interlaced : true}))
    .pipe(gulp.dest(destPath + 'assets/'));
    //.pipe(notify({ message : 'Completed optimizing and transfering assets' }));
});

gulp.task('vendor', function () {
  return gulp.src(paths.vendor)
    .pipe(gulp.dest(destPath + 'lib/'));
    //.pipe(notify({ message : 'Completed transfering vendor files'}));
});

gulp.task('minjquery', function () {
  return gulp.src(paths.jqueryui)
    .pipe(uglify())
    .pipe(concat('jquery.ui.min.js'))
    .pipe(gulp.dest(destPath+'lib/'));
});

gulp.task('minslickgrid', function () {
  return gulp.src(paths.slickgrid)
    .pipe(uglify())
    .pipe(concat('slickgrid.min.js'))
    .pipe(gulp.dest(destPath+'lib/'));
});

// TODO rename
gulp.task('static', function () {
  return gulp.src(paths.static, { base : './src/' })
    .pipe(gulp.dest(destPath));
    //.pipe(notify({ message : 'Completed compiling/ transfering structure files'}));
});

gulp.task('watch', function () {
  // TODO Use gulp-changed/ gulp-newer
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.static, ['static']);
});

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(jshint(jshintrcPath))
    .pipe(jshint.reporter('default'));
});

gulp.task('default', [], function () {
  gulp.start('lint', 'scripts', 'styles', 'assets', 'vendor', 'minjquery', 'minslickgrid', 'static');
});
