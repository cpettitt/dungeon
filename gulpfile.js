"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
var prettyTime = require("pretty-hrtime");
var webserver = require("gulp-webserver");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var merge = require("merge-stream");
var source = require("vinyl-source-stream");
var del = require("del");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");

gulp.task("build:assets", function() {
    gulp.src("assets/**/*")
        .pipe(gulp.dest("dist"));
});

gulp.task("build:js", function() {
    return makeBundleTask(false);
});

gulp.task("build", ["build:assets", "build:js"]);

gulp.task("watch:js", function() {
    return makeBundleTask(true);
});

gulp.task("watch", ["build:assets", "watch:js"], function() {
    gulp.watch("assets/**/*", ["build:assets"]);
});

gulp.task("serve", ["watch"], function() {
    gulp.src("dist/")
        .pipe(webserver({
            host: "0.0.0.0",
            livereload: true
        }));
});

gulp.task("clean", function(cb) {
    del(["dist"], cb);
});

gulp.task("default", ["build"]);

function makeBundleTask(watch) {
    var bundler = browserify({
            debug: true,
            cache: {},
            packageCache: {}
        })
        .add("./src/index.js")
        .transform(babelify);

    function bundle(changedFiles) {
        gutil.log("Starting '" + gutil.colors.cyan("browserify bundle") + "'...");
        var start = process.hrtime();
        var compileStream = bundler.bundle()
            .on("error", function(err) {
                gutil.log(gutil.colors.red("Browserify Error: " + err.message))
                this.emit("end");
            })
            .on("end", function() {
                var end = process.hrtime(start);
                gutil.log("Finished '" + gutil.colors.cyan("browserify bundle") + "' after",
                    gutil.colors.magenta(prettyTime(end)));
            })
            .pipe(source("bundle.js"))
            .pipe(gulp.dest("dist/js"));

        var lintStream;
        if (changedFiles) {
            lintStream = gulp.src(changedFiles);
        } else {
            lintStream = gulp.src("src/**/*.js");
        }

        lintStream = lintStream
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish));

        return merge(lintStream, compileStream);
    }

    if (watch) {
        bundler = watchify(bundler);
        bundler.on("update", bundle);
    }

    return bundle();
}
