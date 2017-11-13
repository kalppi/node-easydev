'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
var markdown = require('helper-markdown');

const env = process.env.NODE_ENV == 'production' ? 'production' : 'development';
const config = require('./config/config.json');
const pg = require('pg');

if(!config && !config.name) {
	console.log('Invalid configuration file');
	return;
}

let port = config.port || process.env.PORT;

const pool = new pg.Pool({
	user: 				config.db[env].user,
	database: 			config.db[env].db,
	password: 			config.db[env].password,
	host: 				config.db[env].host || 'localhost',
	port: 				config.db[env].port || 5432,
	max: 				10,
	idleTimeoutMillis: 	30000
});

pool.connect(() => {

});

const app = express();
const hbs = exphbs.create({
	defaultLayout: 'main',
	extname: '.hb',
	layoutsDir: config.build_dir + '/views/layouts',
	partialsDir: config.build_dir + '/views/partials',
	helpers: {
		md: markdown()
	}
});

app.engine('hb', hbs.engine);
app.set('view engine', '.hb');
app.set('views', './' + config.build_dir + '/views')

app.use(express.static(config.build_dir + '/public'));

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(port, () => {
	console.log("Listening on port", port);
});