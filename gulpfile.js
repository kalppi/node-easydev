'use strict';

const gulp = require('gulp'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber');


const spawn = require('child_process').spawn;

const config = {
	buildPath: './build',
	jsPath: './dev/js/**/*.js',
	viewPath: './dev/views/**/*',
	imgPath: './dev/images/**/*',
	sassPath: './dev/sass/**/*.scss'
};

gulp.task('clean:build', function() {
	const rm = require( 'gulp-rm' );

	return gulp.src(config.buildPath + '/**/*', { read: false })
		.pipe( rm() )
});

gulp.task('css', function() {
	const cssmin = require('gulp-cssmin'),
		sass = require('gulp-ruby-sass');

	return sass(config.sassPath, {
			style: 'compressed',
			stopOnError: true,
			loadPath: [
				config.sassPath
			]
		})
		.on("error", notify.onError(function (error) {
			return "Error: " + error.message;
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(config.buildPath + '/public/css'));
});

gulp.task('images', function() {
	return gulp.src(config.imgPath).pipe(gulp.dest(config.buildPath + '/public/images'));
});

gulp.task('js-dev', function() {
	const jshint = require('gulp-jshint'),
		stylish = require('jshint-stylish'),
		concat = require('gulp-concat');

	return gulp.src(config.jsPath)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest(config.buildPath + '/public/js'));
});


gulp.task('js', function() {
	const uglify = require('gulp-uglify'),
		concat = require('gulp-concat');

	return gulp.src(config.jsPath)
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.buildPath + '/public/js'));
});

gulp.task('views', function() {
	return gulp.src(config.viewPath).pipe(gulp.dest(config.buildPath + '/views'));
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

gulp.task('watch', gulp.series('default', function watch() {
    gulp.watch(config.sassPath, gulp.parallel('css'));
    gulp.watch(config.viewPath, gulp.parallel('views'));
    gulp.watch(config.jsPath, gulp.parallel('js-dev'));
    gulp.watch(config.imgPath, gulp.parallel('images'));

    spawnServer();
}));