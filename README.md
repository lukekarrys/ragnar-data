ragnar-data
=======================

Get, format, filter, and sort the data for each Ragnar race.

[![NPM](https://nodei.co/npm/ragnar-data.png)](https://nodei.co/npm/ragnar-data/)
[![Build Status](https://travis-ci.org/lukekarrys/ragnar-data.png?branch=master)](https://travis-ci.org/lukekarrys/ragnar-data)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Greenkeeper badge](https://badges.greenkeeper.io/lukekarrys/ragnar-data.svg)](https://greenkeeper.io/)

**Requires Node >=6**


## Install
```sh
npm install ragnar-data --save
# or for the CLI
npm install ragnar-data --global
```

## Usage

## JS
```js
const ragnarData = require('ragnar-data')

ragnarData({
  // Filter the list of races (uses _.filter)
  filter: { type: 'trail' },
  // Pick which keys that will be in each result
  pick: ['name', 'elevation_gain', 'distance'],
  // Omit can also be used to blacklist certain keys
  omit: ['legs']
  // Sort the results (uses _.orderBy)
  sort: ['elevation_gain', 'desc'],
  // Will cache data to this directory and use it for subsequent runs
  // Defaults to prefixed path using env-paths.config
  cache: path.resolve(__dirname, '.your-ragnar-data')
  // Request the data from the API even if cache is available
  refresh: true
})
// Returns a promist
.then((races) => console.log(races))
.catch((err) => console.error(err))
```

### CLI
```sh
ragnar-data \
   # A shortcut for filtering based on type
  --type trail \
  # You can always use a properly encoded json object to filter
  --filter '{"type": "trail"}' \
  # Same as above
  --pick name,elevation_gain,distance \
  --omit legs \
  --sort distance,desc \
  --cache .ragnar-data \
  --refresh \
  # How to output the CLI result [table, json, markdown]
  --output table

# See all the options
ragnar-data --help
```

## LICENSE

MIT
