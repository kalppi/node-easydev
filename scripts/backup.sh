#!/bin/bash

NODE=$(which node)

if [ "$NODE_ENV" == "production" ]; then ENV="production"
else ENV="development"
fi

read USER DB <<< $($NODE -e "
	const c = require('./config/config.json');
	console.log(c.db.$ENV.user, c.db.$ENV.db);
")

mkdir -p .backup

cd .backup

FILE=$DB.$(date +%s).sql
LAST=$(ls | sort | tail -n 1)

pg_dump -U $USER -d $DB > $FILE

if cmp -s $FILE $LAST; then
	rm $FILE
fi