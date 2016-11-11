#!/usr/bin/env node

const yargs = require('yargs')
const _ = require('lodash')
const path = require('path')
const Table = require('cli-table')
const ragnar = require('./ragnar')
const { defaultPick, defaultOmit, defaultSort } = require('./constants')
const { defaultAt } = require('./utils')

const coerceJson = JSON.parse
const coerceArray = (arg) => arg.split(',')
const defaultArrayString = (arr) => _.flatten(arr).join(',')

const { argv } = yargs
  .normalize('cache')
  .coerce('cache', (arg) => path.resolve(process.cwd(), arg))

  .coerce('filter', coerceJson)

  .default('pick', defaultArrayString(defaultPick))
  .coerce('pick', coerceArray)

  .default('omit', defaultArrayString(defaultOmit))
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
  .choices('output', ['markdown', 'table', 'json'])
  .choices('type', ['relay', 'trail'])
  .help('help')

const options = _.pick(argv, 'cache', 'filter', 'pick', 'omit', 'sort')

if (!options.filter && argv.type) {
  options.filter = { type: argv.type }
}

const logs = {
  json: (races) => JSON.stringify(races, null, 2),
  table: (races) => {
    const head = _.without(options.pick, ...options.omit).filter((h) => !h.includes('.'))
    const table = new Table({ head: head.map(_.startCase) })
    table.push(...races.map((race) => head.map((prop) => defaultAt(race, prop, ''))))
    return table.toString()
  },
  markdown: (races) => {
    const headers = _.without(options.pick, ...options.omit).filter((h) => !h.includes('.'))
    return [
      headers.map(_.startCase),
      headers.map(() => '--'),
      ...races.map((race) => headers.map((prop) => defaultAt(race, prop, '')))
    ].map((row) => `| ${row.join(' | ')} |`).join('\n')
  }
}

ragnar(options)
  .then((races) => console.log(logs[argv.output] ? logs[argv.output](races) : races))
  .catch(console.error.bind(console))
