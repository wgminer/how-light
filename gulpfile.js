'use-strict';

const gulp = require('gulp'); 
const gutil = require('gulp-util');

const del = require('del');
const runSequence = require('run-sequence');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');

const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const jade = require('gulp-jade'); 

const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();

var ftp = require('vinyl-ftp');
var secrets = require('./secrets.json');

gulp.task('clean', () => {
    return del('./public/**/*');
});

gulp.task('html', () => {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./public'));
});

gulp.task('scss', () => {

    const plugins = [
        require('autoprefixer'),
        require('cssnano')
    ];
    
    return gulp.src(['./src/scss/**/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest('./public/css'));
});
 
gulp.task('js', () => {

    const scripts = [
        './src/js/color.js',
        './src/js/calc.js'
    ];

    return gulp.src(scripts)
        .pipe(sourcemaps.init())  
        .pipe(concat('how-light.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('browser-sync', function() {
    browserSync.init(['./public/css/**/*.css', './public/js/**/*.js', './public/**/*.html'], {
        notify: false,
        server: {
            baseDir: './public'
        }
    });
});

gulp.task('test', function () {
    gulp.src('./tests/*.js')
        .pipe(jasmine())
            .on('error', notify.onError({
                title: 'Jasmine Test Failed',
                message: 'One or more tests failed, see the cli for details.'
            }));
});

gulp.task('build', cb => {
    return runSequence('clean', ['html', 'scss', 'js'], cb);
});

gulp.task('watch', () => {
     gulp.watch('scss/**/*.scss', {cwd: './src'}, ['scss']);
     gulp.watch('harmony/**/*.scss', {cwd: './node_modules'}, ['scss']);
     gulp.watch('js/**/*.js', {cwd: './src'}, ['js']);
     gulp.watch('**/*.html', {cwd: './src'}, ['html']);
});

gulp.task('serve', cb => {
    runSequence('build', ['browser-sync', 'watch'], cb)
});

gulp.task('deploy', ['build'], function () {

    var conn = ftp.create({
        host: secrets.production.host,
        user: secrets.production.user,
        password: secrets.production.password,
        parallel: 3,
        maxConnections: 5,
        log: gutil.log
    }); 

    var globs = [
        './public/**',
    ]

    return gulp.src('./public/**', {base: './public', buffer: false})
        .pipe(conn.newer(secrets.production.path))
        .pipe(conn.dest(secrets.production.path));
});