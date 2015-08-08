var gulp = require("gulp");
var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var less = require('gulp-less');
var path = require('path');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var es = require('event-stream');


var pipes = {};

var paths = {
    scripts: "./src/**/*.js",
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

gulp.task("default", function () {
    return pipes.buildClientCode();
});

gulp.task("compile-code", function () {
    return pipes.buildClientCode();
});

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [ path.join(__dirname, 'bower_components','bootstrap','less')]
        }))
        .on('error', handleError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('./dist/styles'));
});

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task("copy-partials", function(){
    return gulp.src(paths.partials)
        .pipe(gulp.dest('./dist'));
});

gulp.task("watch-code", function () {
    gulp.watch(paths.scripts, ["compile-code"]);
});

gulp.task("watch-less", function () {
    gulp.watch(paths.less, ["less"]);
});

gulp.task("watch-all", ["watch-code","watch-less"]);

gulp.task('index',["compile-code"], function () {
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    //var sources = gulp.src(['./src/**/*.js', './src/**/*.css'], {read: false});

    var sources = gulp.src(['./dist/**/*.js',"./dist/styles/**/*.css"], {read: false});


    gulp.src('./src/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
        .pipe(inject(sources,{ignorePath:"/dist"}))
        .pipe(gulp.dest("./dist"));
});