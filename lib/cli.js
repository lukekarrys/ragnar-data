#!/usr/bin/env node

const yargs = require('yargs')
const _ = require('lodash')
const ragnar = require('./ragnar')
const { defaultProps, defaultSort } = require('./constants')

const coerceJson = JSON.parse
const coerceArray = (arg) => arg.split(',')
const defaultArrayString = (arr) => _.flatten(arr).join(',')

const {argv} = yargs
  .boolean('cache')
  .default('cache', true)

  .coerce('filter', coerceJson)

  .default('pick', defaultArrayString(defaultProps))
  .coerce('pick', coerceArray)

  .default('omit', '')
  .coerce('omit', coerceArray)

  .default('sort', defaultArrayString(defaultSort))
  .coerce('sort', (arg) => {
    const props = []
    const order = []

    // Allows for all the following:
    // - elevation (defaults to asc from lodash)
    // - elevation,desc
    // - elevation,distance (defaults to asc from lodash)
    // - elevation,desc,distance,asc
    arg.split(',').forEach((prop) => {
      if (prop === 'desc' || prop === 'asc') {
        order.push(prop)
      } else {
        props.push(prop)
      }
    })

    return [props, order]
  })
  .choices('output', ['table', 'json'])
  .choices('type', ['relay', 'trail'])
  .help('help')

const options = _.pick(argv, 'cache', 'filter', 'props', 'omit', 'sort')

if (!options.filter && argv.type) {
  options.filter = { type: argv.type }
}

const logs = {
  json: (races) => JSON.stringify(races, null, 2),
  table: (races) => {
    const headers = options.props.filter((h) => !h.includes('.'))
    return [
      headers.map(_.startCase),
      headers.map(() => '--'),
      ...races.map((race) => headers.map((prop) => _.at(race, prop, '')[0]))
    ].map((row) => `| ${row.join(' | ')} |`).join('\n')
  }
}

ragnar(options)
  .then((races) => console.log(logs[argv.output] ? logs[argv.output](races) : races))
  .catch(console.error.bind(console))
