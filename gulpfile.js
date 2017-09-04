const autoprefixer = require('gulp-autoprefixer');
const composer = require('gulp-uglify/composer');
const gulp = require('gulp');
const pump = require('pump');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const uglifyjs = require('uglify-es');

const minify = composer(uglifyjs, console);

//=============================================//
//                    CONFIG                   //
//=============================================//

const config = {
	// user configuration
	css_dir: 'public/css',
	js_dir: 'public/js',
	js_output: 'all.js',

	// plugin configuration
	browsers: ['ie 11'],  // added to later
	sass: {
		indentedSyntax: true,  // SASS, not SCSS
		outputStyle: 'compressed',
	},
	js: {
		entry: 'public/js/combined.js',
		format: 'cjs',
		treeshake: false // breaks some things
	},
	uglify: {
		mangle: true,
		compress: true
	}
};

// more readable than listing them all out in full
// don't care about mobile for this specific project
['chrome', 'ff', 'safari', 'opera', 'edge'].forEach(browser => config.browsers.push(`last 2 ${browser} versions`));

//=============================================//
//                    TASKS                    //
//=============================================//

gulp.task('sass', () => {
	gulp.src(`${config.css_dir}/all.sass`)
		.pipe(sass(config.sass).on('error', sass.logError))
		.pipe(autoprefixer({browsers: config.browsers}))
		.pipe(gulp.dest(config.css_dir));
});

gulp.task('rollup', () => {
	rollup(config.js)
		.pipe(source(config.js_output))
		.pipe(gulp.dest(config.js_dir));
});

gulp.task('js', ['rollup'], cb => {
	const options = {};

	pump(
		[
			gulp.src(`${config.js_dir}/${config.js_output}`),
			minify(options),
			gulp.dest(config.js_dir)
		],
		cb
	);
});

gulp.task('watch', () => {
	gulp.watch(`${config.css_dir}/**/*.sass`, ['sass']);
	gulp.watch(`${config.css_dir}/**/*.scss`, ['sass']);
	gulp.watch([`${config.js_dir}/**/*.js`, `!${config.js_dir}/**/${config.js_output}`], ['js']);
});

gulp.task('default', ['sass', 'js', 'watch']);
