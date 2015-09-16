var babelify = require("babelify");
var browserify = require("browserify");
var browserSync = require("browser-sync");
var fs = require("fs-extra");
var path = require("path");
var uglifyify = require("uglifyify");
var watchSync = require("watch-sync");
var watchify = require("watchify");

var persistent = "PERSISTENT" in process.env
  ? process.env.PERSISTENT.toLowerCase() === "true"
  : false;

// Init build directory
var buildDir = "build";
fs.mkdirsSync(buildDir);

// Sync assets file system
watchSync(".", buildDir, { cwd: "assets", delete: "after-ready", persistent: persistent })
  .on("all", function(e, f, dp) { console.log(e, f, dp); });

// Build browserify bundle
fs.mkdirsSync(path.join(buildDir, "js"));
var bundler = browserify("./src/index.js", { debug: true, cache: {}, packageCache: {} })
  .transform(babelify)
  .transform(uglifyify);

function bundle() {
  bundler.bundle()
    .on("error", function(err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream(path.join(buildDir, "js", "bundle.min.js")));
}

if (persistent) {
  bundler = watchify(bundler);
  bundler.on("update", bundle);
}
bundle();

// Start live reload HTTP server
if (persistent) {
  browserSync.init({
      files: buildDir,
      notify: false,
      reloadOnRestart: true,
      server: {
          baseDir: buildDir
      }
  });
}
