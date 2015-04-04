"use strict";

var gulp = require("gulp");
var webserver = require("gulp-webserver");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var del = require("del");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");

gulp.task("build:assets", function() {
    gulp.src("assets/**/*")
        .pipe(gulp.dest("dist"));
});

gulp.task("build:js", function() {
    gulp.src("src/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish));

    return browserify({ debug: true })
        .add("./src/index.js")
        .transform(babelify)
        .bundle()
            .on("error", function(err) {
                console.log(err.message);
                return this;
            })
            .pipe(source("bundle.js"))
            .pipe(gulp.dest("dist/js"));
});

gulp.task("build", ["build:assets", "build:js"]);

gulp.task("watch", function() {
    gulp.watch("assets/**/*", ["build:assets"]);
    gulp.watch("src/**/*.js", ["build:js"]);
});

gulp.task("serve", ["build", "watch"], function() {
    gulp.src("dist/")
        .pipe(webserver({ livereload: true }));
});

gulp.task("clean", function(cb) {
    del(["dist"], cb);
});

gulp.task("default", ["build"]);
