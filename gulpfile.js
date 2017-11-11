const gulp = require('gulp');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const purify = require('gulp-purifycss');
const composer = require('gulp-uglify/composer');
const pump = require('pump');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const uglifyjs = require('uglify-es');
const runSequence = require('run-sequence');

const minify = composer(uglifyjs, console);

//=============================================//
//                    CONFIG                   //
//=============================================//

const config = {
    // user configuration
    css_dir: 'src/public/css',
    css_output: 'all.css',
    js_dir: {
        all: 'src/public/js',
        modules: 'src/public/js/modules',
        packages: 'src/public/js/packages'
    },
    js_output: {
        modules: 'all-modules.js',
        packages: 'all-packages.js'
    },
    html_dir: 'src/pages',
    section_dir: 'src/sections',

    // plugin configuration
    postcss: [
        require('precss'),
        require('postcss-short')({
            'size': false,
            'color': false,
            'border': false,
        }),
        require('postcss-modern-properties'),
        require('postcss-font-magician'),
        require('postcss-hexrgba'),
        require('postcss-calc'),
        require('postcss-color-hex-alpha'),
        require('postcss-will-change'),
        require('postcss-color-mix'),
        require('postcss-display-visible'),
        require('autoprefixer')({
            browsers: [
                'last 2 chrome versions',
                'last 2 ff     versions',
                'last 2 safari versions',
                'last 2 opera  versions',
                'last 2 edge   versions',
            ],
        }),
    ],
    purifycss: {
        content: [
            'src/public/js/all-modules.js',
            'src/public/js/all-packages.js',
            'src/**/*.erb',
            'src/**/*.html',
        ],
        options: {
            minify: true,
        },
    },
    js: {
        modules: {
            entry: 'src/public/js/modules.js',
            format: 'cjs',
            treeshake: false  // breaks some things
        },
        packages: {
            entry: 'src/public/js/packages.js',
            format: 'cjs'
        },
    },
    uglify: {
        mangle: true,
        compress: true
    },
};

//=============================================//
//                    TASKS                    //
//=============================================//

gulp.task('postcss', () => {
    return gulp.src(`${config.css_dir}/all.pcss`)
        .pipe(postcss(config.postcss))
        .pipe(purify(config.purifycss.content, config.purifycss.options))
        .pipe(postcss([require('cssnano')]))
        .pipe(concat(config.css_output))
        .pipe(gulp.dest(config.css_dir));
});

gulp.task('rollup-modules', () => {
    return rollup(config.js.modules)
        .pipe(source(config.js_output.modules))
        .pipe(gulp.dest(config.js_dir.all));
});

gulp.task('rollup-packages', () => {
    return rollup(config.js.packages)
        .pipe(source(config.js_output.packages))
        .pipe(gulp.dest(config.js_dir.all));
});

gulp.task('js-modules', ['rollup-modules'], () => {
    return pump([
        gulp.src(`${config.js_dir.all}/${config.js_output.modules}`),
        minify(config.uglify),
        gulp.dest(config.js_dir.all)
    ]);
});

gulp.task('watch', () => {
    gulp.watch(`${config.css_dir}/**/*.pcss`, ['postcss']);
    gulp.watch(`${config.html_dir}/**/*.erb`, ['postcss']);
    gulp.watch(`${config.section_dir}/**/*.erb`, ['postcss']);
    gulp.watch([`${config.js_dir.modules}/**/*.js`, config.js.modules.entry], ['js-modules']);
    gulp.watch([`${config.js_dir.packages}/**/*.js`, config.js.packages.entry], ['rollup-packages']);
});

gulp.task('build', () => {
    // make sure CSS compilation runs after JS is done
    return runSequence(['rollup-packages', 'js-modules'], 'postcss');
});

gulp.task('default', ['build', 'watch']);
