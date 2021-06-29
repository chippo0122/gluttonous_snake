const gulp = require('gulp');
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');;
const uglify = require('gulp-uglify');

gulp.task('copy', function () {
    return gulp.src(['./source/**/*.html', './source/**/*.jpg'])
        .pipe(gulp.dest('./public'));
});

gulp.task('watch', function () {
    return watch(['./source/**/*.html', './source/**/*.js', './source/**/*.scss'],
        gulp.series('sass', 'copy', 'babel')
    )
});

gulp.task('sass', function () {
    return gulp.src('./source/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(plumber())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('babel', function () {
    return gulp.src('./source/**/*.js') // javascript 檔案路徑
        .pipe(
            babel({
                presets: ['es2015'], // 使用預設環境編譯
            })
        )
        .pipe(
            uglify()
        )
        .pipe(gulp.dest('./public'))
})

gulp.task('default', gulp.series('sass', 'babel', 'copy', 'watch'));