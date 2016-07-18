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

const shell = require('gulp-shell')
const child = require('child_process');


gulp.task('clean', () => {
    return del('./public/**/*');
});

gulp.task('icons', () => {
    return gulp.src('./node_modules/harmony/src/icons/**/*')
        .pipe(gulp.dest('./public/icons'));
});

gulp.task('fonts', () => {
    return gulp.src('./node_modules/ui-fonts/fonts/**/*')
        .pipe(gulp.dest('./public/fonts'));
});

gulp.task('html', () => {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./public'));
});

gulp.task('scss', () => {

    const plugins = [
        require('autoprefixer')
        // require('cssnano')
    ];
    
    return gulp.src(['./src/scss/**/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest('./public/css'));
});
 
gulp.task('js', () => {

    const scripts = [
        './node_modules/jquery/dist/jquery.js',
        './node_modules/angular/angular.js',
        './src/js/*.js'
    ];

    return gulp.src(scripts)
        .pipe(sourcemaps.init())  
        .pipe(concat('how-light.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: 'index.js',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            'public/',
            'src/'
        ]
    })
    .on('start', function () {
        if (!called) {
            called = true;
            cb();
        }
    })
    .on('restart', function () {
        setTimeout(function () {
            browserSync.reload({ stream: false });
        }, 1000);
    });
});

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init(['./public/css/**/*.css', './public/js/**/*.js', './public/**/*.html'], {
        proxy: 'http://localhost:8080',
        files: ['public/**/*.*'],
        browser: 'google chrome',
        port: 3000,
    });
});


gulp.task('build', cb => {
    return runSequence('clean', 'icons', 'fonts', ['html', 'scss', 'js'], cb);
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