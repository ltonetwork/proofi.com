'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const imageminWebp = require("imagemin-webp");
const imageminPngQuant = require("imagemin-pngquant");
const critical = require("critical").stream;
const del = require("del");


// -----------------------------------------------------------------------------
// Gulp plugins
// -----------------------------------------------------------------------------

const gulpAutoprefixer = require("gulp-autoprefixer");
const gulpNunjucksRender = require("gulp-nunjucks-render");
const gulpConcat = require("gulp-concat");
const gulpImagemin = require("gulp-imagemin");
const gulpRename = require("gulp-rename");
const gulpCleancss = require("gulp-clean-css");
const gulpHtmlmin = require("gulp-htmlmin");
const gulpBabel = require("gulp-babel");
const gulpUglify = require("gulp-uglify");
const gulpttf2woff2 = require("gulp-ttf2woff2");
const gulpPurgecss = require("gulp-purgecss");


// -----------------------------------------------------------------------------
// Directories
// -----------------------------------------------------------------------------

const distDirectory = "dist";
const imageDirectory = "src/assets/**/*.+(jpg|jpeg|png|gif|svg)";
const sassFiles = "src/scss/**/*.scss";
const scriptFiles = "src/js/**/*.js";
const fontFiles = "src/assets/fonts/**/*.+(ttf|otf)";
const videoDirectory = "src/assets/media/*.+(mp4|mkv|mov)";

const nunjucksPages = "src/pages/**/*.+(html|njk)";
const nunjucksTemplates = "src/templates";
const nunjucksFiles = [
  "src/pages/**/*.+(html|njk)",
  "src/templates/**/*.+(html|njk)"
];


// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const sassOptions = {
    outputStyle: "expanded",
    includePaths: ["./node_modules"]
};

const autoprefixerOptions = {};

const htmlMinOptions = {
    collapseWhitespace: true
};

const imageminOptions = {
    progressive: true,
    svgoPlugins: [{
        removeViewBox: false
    }],
    use: [imageminPngQuant()]
};


// -----------------------------------------------------------------------------
// Compile sass
// -----------------------------------------------------------------------------

gulp.task("compile-sass", () => {
    return gulp.src(sassFiles)
        .pipe(sass(sassOptions).on("error", sass.logError))
        .pipe(gulpAutoprefixer(autoprefixerOptions))
        .pipe(gulpConcat('main.css'))
        .pipe(gulpPurgecss({
            content: nunjucksFiles,
            whitelist: [
        'is-active',
        'is-fixed-top',
        'is-transparent',
        'visible',
        'inverted-mobile',
        'flex-row',
        'flex-column'
      ]
        }))
        .pipe(gulpCleancss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(`${distDirectory}/css`))
        .pipe(browserSync.stream());
});


// -----------------------------------------------------------------------------
// Combine vendor and our compiled CSS
// -----------------------------------------------------------------------------

// gulp.task('combine-css', gulp.series('sass', function () {
//   return gulp
//     .src([
//       './node_modules/bulma/css/bulma.min.css',
//       './node_modules/bulma-helpers/css/bulma-helpers.min.css',
//       './dist/css/main.css'
//     ])
//     .pipe(concat('main.css'))
//     .pipe(cleanCSS({ compatibility: 'ie8' }))
//     .pipe(gulp.dest(output))
//     .pipe(browserSync.stream());
// }));


// -----------------------------------------------------------------------------
// Compile scripts
// -----------------------------------------------------------------------------

gulp.task("compile-scripts", () => {
    return gulp.src([
      scriptFiles
    ])
        .pipe(gulpConcat("main.js"))
        .pipe(gulpBabel({
            presets: ['@babel/env']
        }))
        .pipe(gulpUglify())
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest(`${distDirectory}/js`));
});


// -----------------------------------------------------------------------------
// Compile Nunjucks templates
// -----------------------------------------------------------------------------

gulp.task("compile-nunjucks", () => {
    return gulp.src(nunjucksPages)
        .pipe(gulpNunjucksRender({
            path: nunjucksTemplates
        }))
        .pipe(gulpHtmlmin(htmlMinOptions))
        .pipe(gulp.dest(distDirectory))
});


// -----------------------------------------------------------------------------
// Optimize images
// -----------------------------------------------------------------------------

gulp.task("optimize-images", () => {
    return gulp.src(imageDirectory)
        .pipe(gulpImagemin(imageminOptions))
        .pipe(gulp.dest(`${distDirectory}/assets`));
});


// -----------------------------------------------------------------------------
// Copy images (only for developing on slower machines)
// -----------------------------------------------------------------------------

gulp.task("copy-images", () => {
    return gulp
        .src(imageDirectory)
        .pipe(
            gulpRename(function (path) {
                path.dirname = path.dirname.toLowerCase()
                path.basename = path.basename.toLowerCase()
                path.extname = path.extname.toLowerCase()
            })
        )
        .pipe(gulp.dest(`${distDirectory}/assets`))
})


// -----------------------------------------------------------------------------
// Copy media
// -----------------------------------------------------------------------------

gulp.task("copy-media", () => {
    return gulp
        .src(videoDirectory)
        .pipe(
            gulpRename(function (path) {
                path.dirname = path.dirname.toLowerCase()
                path.basename = path.basename.toLowerCase()
                path.extname = path.extname.toLowerCase()
            })
        )
        .pipe(gulp.dest(`${distDirectory}/assets/media`))
})

// -----------------------------------------------------------------------------
// Compile fonts
// -----------------------------------------------------------------------------

gulp.task("compile-fonts", () => {
    return gulp.src(fontFiles)
        .pipe(gulpttf2woff2())
        .pipe(gulp.dest(`${distDirectory}/assets/fonts`))
        .pipe(browserSync.stream());
});


// -----------------------------------------------------------------------------
// Generate .webp images
// -----------------------------------------------------------------------------

gulp.task("generate-webp", () => {
    return gulp.src(imageDirectory, {
            nodir: true
        })
        .pipe(gulpImagemin([imageminWebp({
            quality: 75
        })]))
        .pipe(gulpRename({
            extname: '.webp'
        }))
        .pipe(gulp.dest(`${distDirectory}/assets`));
});


// -----------------------------------------------------------------------------
// Copy additional resources
// -----------------------------------------------------------------------------

gulp.task("copy-resources", () => {
    return gulp.src([
    "src/assets/**/*.xml"
  ], {
            nodir: true
        })
        .pipe(gulp.dest(`${distDirectory}/assets`));
});


// -----------------------------------------------------------------------------
// Copy meta
// -----------------------------------------------------------------------------

gulp.task("copy-meta", () => {
    return gulp.src([
    "src/robots.txt",
    "src/sitemap_index.xml"
  ], {
            nodir: true
        })
        .pipe(gulp.dest(`${distDirectory}/`));
});


// -----------------------------------------------------------------------------
// Browsersync
// -----------------------------------------------------------------------------

gulp.task("browser-sync", function () {
    browserSync.init({
        server: {
            baseDir: distDirectory
        },
    })
});


// -----------------------------------------------------------------------------
// Clean up
// -----------------------------------------------------------------------------

gulp.task("clean:dist", () => {
    return del([
    "dist/**/*.html",
    "dist/**/*.css",
    "dist/**/*.js",
  ]);
});


// -----------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------

gulp.task("watch", () => {
    gulp.watch(sassFiles, gulp.series(["compile-sass"])).on("change", browserSync.reload);
    gulp.watch(scriptFiles, gulp.series(["compile-scripts"])).on("change", browserSync.reload);
    gulp.watch(nunjucksFiles, gulp.series("compile-nunjucks")).on("change", browserSync.reload);
});


// -----------------------------------------------------------------------------
// Critical (above the fold) generator
// -----------------------------------------------------------------------------

gulp.task("critical", () => {
    return gulp
        .src("dist/**/*.html")
        .pipe(critical({
            base: distDirectory,
            inline: true,
            minify: true,
            css: ["dist/css/main.css"],
            dimensions: [
                {
                    height: 667,
                    width: 375,
          },
                {
                    height: 800,
                    width: 1280,
          },
        ]
        }))
        .on("error", (err) => {
            log.error(err.message);
        })
        .pipe(gulp.dest(distDirectory));
});


// -----------------------------------------------------------------------------
// Task
// -----------------------------------------------------------------------------

gulp.task("build-fast", gulp.parallel("compile-sass", "compile-nunjucks", "compile-scripts", "copy-images", "copy-media", "copy-resources"));
gulp.task("build", gulp.parallel("compile-sass", "compile-nunjucks", "compile-scripts", "optimize-images", "generate-webp", "copy-media", "compile-fonts", "copy-resources"));

gulp.task("build-prod-fast", gulp.series("clean:dist", "build-fast", "critical"));
gulp.task("build-prod", gulp.series("clean:dist", "build", "critical"));

gulp.task("default", gulp.parallel("build-fast", "watch", "browser-sync"));
gulp.task("serve", gulp.parallel("browser-sync"));
