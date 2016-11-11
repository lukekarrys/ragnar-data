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
  sort: [['elevation_gain'], ['desc']]
})

getRagnar
  .then((races) => console.log(races))
  .catch((err) => console.error(err))
```

### CLI
```sh
ragnar-data --type trail --pick name,distance --sort distance,desc --output table --cache .ragnar-data
```

## LICENSE

MIT
