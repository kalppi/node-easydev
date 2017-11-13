'use strict';

const gulp = require('gulp'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	livereload = require('gulp-livereload'),
	injector = require('gulp-livereload-inject');

const config = require('./config/config.json');

const spawn = require('child_process').spawn;

const gulpConfig = {
	buildPath: './' + config.build_dir,
	jsPath: './dev/js/**/*.js',
	viewPath: './dev/views/**/*',
	imgPath: './dev/images/**/*',
	sassPath: './dev/sass/**/*.scss'
};

gulp.task('clean:build', function() {
	const rm = require( 'gulp-rm' );

	return gulp.src(gulpConfig.buildPath + '/**/*', { read: false })
		.pipe( rm() )
});

gulp.task('css', function() {
	const cssmin = require('gulp-cssmin'),
		sass = require('gulp-ruby-sass');

	return sass(gulpConfig.sassPath, {
			style: 'compressed',
			stopOnError: true,
			loadPath: [
				gulpConfig.sassPath
			]
		})
		.on("error", notify.onError(function (error) {
			return "Error: " + error.message;
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(gulpConfig.buildPath + '/public/css'));
});

gulp.task('images', function() {
	return gulp.src(gulpConfig.imgPath).pipe(gulp.dest(gulpConfig.buildPath + '/public/images'));
});

gulp.task('js-dev', function() {
	const jshint = require('gulp-jshint'),
		stylish = require('jshint-stylish'),
		concat = require('gulp-concat');

	return gulp.src(gulpConfig.jsPath)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest(gulpConfig.buildPath + '/public/js'));
});


gulp.task('js', function() {
	const uglify = require('gulp-uglify'),
		concat = require('gulp-concat');

	return gulp.src(gulpConfig.jsPath)
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(gulpConfig.buildPath + '/public/js'));
});

gulp.task('views', function() {
	return gulp.src(gulpConfig.viewPath).pipe(gulp.dest(gulpConfig.buildPath + '/views'));
})

gulp.task('views-dev', function() {
	console.log("###")
	return gulp.src(gulpConfig.viewPath).pipe(injector()).pipe(gulp.dest(gulpConfig.buildPath + '/views')).pipe(livereload());
})

let server = null;
function spawnServer() {
	if(server) {
		console.log('Killing old server');
		server.kill();
	}

	console.log('Spawning new server...');
    server = spawn('node', ['server.js']);

    server.stderr.on('data', (data) => {
		console.log("> " + data);
	});

	server.stdout.on('data', (data) => {
		console.log("> " + data);
	});

	gulp.watch('server.js', function() {
		console.log('Server change detected, spawning new');

		spawnServer();
	});
}

gulp.task('default', gulp.series('clean:build', 'css', 'js', 'images', 'views'));

gulp.task('dev', gulp.series('clean:build', 'css', 'js-dev', 'images', 'views-dev'));

gulp.task('watch', gulp.series('dev', function watch() {
	livereload.listen();

    gulp.watch(gulpConfig.sassPath, gulp.parallel('css'));
    gulp.watch(gulpConfig.viewPath, gulp.parallel('views-dev'));
    gulp.watch(gulpConfig.jsPath, gulp.parallel('js-dev'));
    gulp.watch(gulpConfig.imgPath, gulp.parallel('images'));

    spawnServer();
}));