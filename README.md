ragnar-data
=======================

Get, format, filter, and sort the data for each Ragnar race.

[![NPM](https://nodei.co/npm/ragnar-data.png)](https://nodei.co/npm/ragnar-data/)
[![Build Status](https://travis-ci.org/lukekarrys/ragnar-data.png?branch=master)](https://travis-ci.org/lukekarrys/ragnar-data)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Install
```sh
npm install ragnar-data --save
# or for the CLI
npm install ragnar-data --global
```

## Usage

## JS
```js
const ragnar = require('ragnar-data')

const getRagnar = ragnar({
  filter: { type: 'trail' },
  cache: path.resolve(__dirname, '.ragnar-data'),
  pick: ['name', 'elevation_gain', 'distance'],
  // Omit is also available to blacklist certain keys
  // omit: ['legs']
  sort: ['elevation_gain', 'desc']
})

getRagnar
  .then((races) => console.log(races))
  .catch((err) => console.error(err))
```

### CLI
```sh
ragnar-data \
  --type trail \ # A shortcut for filtering based on type
  # You can always use a properly encoded json object to filter like
  # --filter '{"type": "trail"}'
  --pick name,elevation_gain,distance \
  --sort distance,desc \
  --cache .ragnar-data \
  --output table # Can also be json or markdown

# See all the options
ragnar-data --help
```

## LICENSE

MIT
