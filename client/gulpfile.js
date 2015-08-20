var gulp = require("gulp"),
    babel = require("gulp-babel"),
    sourcemaps = require("gulp-sourcemaps"),
    concat = require("gulp-concat"),
    less = require('gulp-less'),
    path = require('path'),
    inject = require('gulp-inject'),
    bowerFiles = require('main-bower-files'),
    es = require('event-stream'),
    angularFilesort = require('gulp-angular-filesort');


function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

var pipes = {};

var paths = {
    scripts: "./src/app/**/*.js",
    less: "./src/less/style.less",
    partials: ['./src/app/**/*.html', '!./src/app/index.html']
};

pipes.buildClientCode = function () {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', handleError)
        //.pipe(concat("main.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dist"));
};

gulp.task("default", ["compile-code", "less", "index", "copy-partials"]);

gulp.task("compile-code", function () {
    return pipes.buildClientCode();
});

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [path.join(__dirname, 'bower_components', 'bootstrap', 'less')]
        }))
        .on('error', handleError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('./dist/styles'));
});

gulp.task("copy-partials", function () {
    return gulp.src(paths.partials)
        .pipe(gulp.dest('./dist'));
});

gulp.task("watch-code", function () {
    gulp.watch(paths.scripts, ["compile-code", "index"]);
});

gulp.task("watch-less", function () {
    gulp.watch(paths.less, ["less", "index"]);
});

gulp.task("watch-all", ["default"], function () {
    gulp.watch(paths.scripts, ["compile-code", "inject"]);
    gulp.watch(paths.less, ["less", "inject"]);
    gulp.watch(paths.partials, ["copy-partials"]);
});

gulp.task('inject', function () {
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./dist/**/*.js']);

    var css = gulp.src(["./dist/styles/**/*.css"],{read:false});

    gulp.src('./src/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
        .pipe(inject(css, {ignorePath: "/dist"}))
        .pipe(inject(sources.pipe(angularFilesort()), {ignorePath: "/dist"}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("index", ["compile-code", 'inject']);