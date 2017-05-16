#!/bin/bash

NODE=$(which node)

read NAME HOST PORT REMOTE_PATH USER <<< $($NODE -e "
	const c = require('./config/config.json');
	console.log(c.name, c.deploy.host, c.deploy.port, c.deploy.path, c.deploy.user);
")

gulp

ssh $USER@$HOST -p $PORT "
cd $REMOTE_PATH
mkdir -p $NAME
cd $NAME
exit"

rsync -urze "ssh -p $PORT" --progress --exclude=.backup --exclude=dev --exclude=*.log.* --exclude=node_modules --exclude=.git --exclude=.gitignore $(pwd)/ $USER@$HOST:$REMOTE_PATH/$NAME/

ssh $USER@$HOST -p $PORT -t "
cd $REMOTE_PATH/$NAME
npm install --production
if [ \"$1\" = \"sql\" ]; then
	NODE_ENV=production npm run sql
fi
npm run generate-configs
exit"
