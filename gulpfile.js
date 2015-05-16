"use strict";

var _ = require("lodash");
var babelify = require("babelify");
var browserSync = require("browser-sync");
var browserify = require("browserify");
var buffer = require("vinyl-buffer");
var changed = require("gulp-changed");
var del = require("del");
var gulp = require("gulp");
var gutil = require("gulp-util");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var merge = require("merge-stream");
var prettyTime = require("pretty-hrtime");
var rename = require("gulp-rename");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var watch = require("gulp-watch");
var watchify = require("watchify");

var ASSETS_SRC = "assets/**/*";
var BUILD_DIR = "build";

gulp.task("assets:copy", function() {
    return gulp.src(ASSETS_SRC)
        .pipe(gulp.dest("build"));
});

gulp.task("assets:watch", function() {
    // Not at all redundant! :)
    gulp.src(ASSETS_SRC)
        .pipe(watch(ASSETS_SRC, { verbose: true }))
        .pipe(changed(BUILD_DIR))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("js:build", function() {
    return makeBundleTask(false, { debug: true });
});

gulp.task("js:watch", function() {
    return makeBundleTask(true, { debug: true });
});

gulp.task("build", ["assets:copy", "js:build"]);

gulp.task("watch", ["assets:watch", "js:watch"]);

gulp.task("serve", ["watch"], function() {
    browserSync.init({
        files: BUILD_DIR + "/**/*",
        notify: false,
        reloadOnRestart: true,
        server: {
            baseDir: BUILD_DIR
        }
    });
});

gulp.task("clean", function(cb) {
    del(BUILD_DIR, cb);
});

gulp.task("default", ["build"]);

function makeBundleTask(watch, args) {
    var bundler = browserify(_.defaults(args, watchify.args))
        .add("./src/index.js")
        .transform(babelify);

    function bundle(changedFiles) {
        gutil.log("Starting '" + gutil.colors.cyan("browserify bundle") + "'...");
        var start = process.hrtime();
        var compileStream = bundler.bundle()
            .on("error", function(err) {
                gutil.log(gutil.colors.red("Browserify Error: " + err.message));
                this.emit("end");
            })
            .on("end", function() {
                var end = process.hrtime(start);
                gutil.log("Finished '" + gutil.colors.cyan("browserify bundle") + "' after",
                    gutil.colors.magenta(prettyTime(end)));
            })
            .pipe(source("bundle.js"))
            .pipe(gulp.dest(BUILD_DIR + "/js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .pipe(rename({ suffix: ".min" }))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest(BUILD_DIR + "/js"));

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
