'use strict';

let gulp = require('gulp');
let nodemon = require('gulp-nodemon');

gulp.task('default', function () {
    nodemon({
        script: 'index.js',
        ext: 'js',
        ignore: ['node_modules/*']
    }).on('restart', function () {
        console.log('restarted!');
    });
});