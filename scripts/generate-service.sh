#!/bin/bash

NODE=$(which node)

read NAME REMOTE_PATH USER <<< $($NODE -e "
	const c = require('./config/config.json');
	console.log(c.name, c.deploy.path, c.deploy.user);
")

if [ -z "$NAME" ]; then
	exit 1
fi

if [ -f "/lib/systemd/system/$NAME.service" ]; then
	echo "Restarting service..."
	sudo systemctl restart $NAME.service
else
	echo "Setting up service..."

	FILE="$NAME.service"

	cat > config/$FILE <<- EOF
[Service]
WorkingDirectory=$REMOTE_PATH/$NAME
ExecStart=$NODE $REMOTE_PATH/$NAME/server.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$NAME
User=$USER
Group=$USER
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

	sudo mv config/$FILE /lib/systemd/system/;
	rm config/$FILE

	sudo systemctl enable $NAME.service
	sudo systemctl start $NAME.service
fi
