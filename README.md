# node-easydev
Base for fast node application development.

## commands

`gulp`
Builds everything.

`gulp watch`
Launches server.js and rebuilds when files change.

`npm run sql`
(Re)creates the development database and adds testdata (see: `sql/*.sql`).

`npm run deploy`
Uploads files to specified remote server (see: `config/config.json`).

`npm run deploy sql`
Uploads files, backups database and recreates it.