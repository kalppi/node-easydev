#!/bin/bash

NODE=$(which node)

if [ "$NODE_ENV" == "production" ]; then ENV="production"
else ENV="development"
fi

read USER DB <<< $($NODE -e "
	const c = require('./config/config.json');
	console.log(c.db.$ENV.user, c.db.$ENV.db);
")

if [ "$NODE_ENV" == "production" ]; then
	NODE_ENV=production npm run backup
	cat sql/drop_tables.sql sql/create_tables.sql | psql -U $USER -d $DB
else
	cat sql/drop_tables.sql sql/create_tables.sql sql/add_test_data.sql | psql -U $USER -d $DB
fi

