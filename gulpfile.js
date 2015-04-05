"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
var gulpif = require("gulp-if");
var prettyTime = require("pretty-hrtime");
var webserver = require("gulp-webserver");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var uglify = require("gulp-uglify");
var merge = require("merge-stream");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var del = require("del");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");

var devMode = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
var buildDir = devMode ? "build" : "dist";

gulp.task("build:assets", function() {
    gulp.src("assets/**/*")
        .pipe(gulp.dest(buildDir));
});

gulp.task("build:js", function() {
    return makeBundleTask(false);
});

gulp.task("build", ["build:assets", "build:js"]);

gulp.task("watch:js", function() {
    if (devMode) {
        return makeBundleTask(true);
    }
});

gulp.task("watch", ["build:assets", "watch:js"], function() {
    if (devMode) {
        gulp.watch("assets/**/*", ["build:assets"]);
    } else {
        gutil.log(gutil.colors.red("Watches disabled in non-dev modes!"));
    }
});

gulp.task("serve", ["watch"], function() {
    gulp.src(buildDir)
        .pipe(webserver({
            host: "0.0.0.0",
            livereload: true
        }));
});

gulp.task("clean", function(cb) {
    del(["build", "dist"], cb);
});

gulp.task("default", ["build"]);

function makeBundleTask(watch) {
    var bundler = browserify({
            debug: devMode,
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
            .pipe(buffer())
            .pipe(gulpif(!devMode, uglify()))
            .pipe(gulp.dest(buildDir + "/js"));

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
