
const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');        // for gulp-uglify and gulp-babel
const babel = require('gulp-babel');
const inject = require('gulp-inject');

gulp.task('default', ['html', 'css', 'js']);

gulp.task('html', () => {
    return gulp.src('index.html')
        .pipe(inject(gulp.src('components/*.vue'), {
            starttag: '<!-- inject:components -->',
            transform(fp, file) { return file.contents.toString('utf8'); },
        }))
        .pipe(gulp.dest(`../public`));
});

gulp.task('css', () => {
    return gulp.src('scss/style.scss')
        .pipe(sass())
        .pipe(gulp.dest('../public'));
});

gulp.task('js', () => {
    return rollup({ entry: 'js/app.js', format: 'iife' })
        .pipe(source('app.js'))
        .pipe(streamify(babel({
            presets: ['es2015'],
        })))
        .pipe(gulp.dest(`../public`));
});

gulp.task('watch', ['default'], () => {
    watch('index.html', () => gulp.start('html'));
    watch('components/*.vue', () => gulp.start('html'));
    watch('js/*.js', () => gulp.start('js'));
    watch('js/*/*.js', () => gulp.start('js'));
    watch('scss/*.scss', () => gulp.start('css'));
    watch('scss/*/*.scss', () => gulp.start('css'));
});