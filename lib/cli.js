#!/usr/bin/env node

const yargs = require('yargs')
const _ = require('lodash')
const path = require('path')
const Table = require('cli-table')
const ragnar = require('./ragnar')
const debug = require('./debug')('cli')
const { defaultPick, defaultOmit, defaultSort, defaultCache, defaultRefresh } = require('./constants')
const { toTable, coerceArray, arrayToString } = require('./utils')

const outputOptions = {
  json: (data) => JSON.stringify(data, null, 2),
  table: (data) => {
    const { head, rows } = toTable({ data, pick, omit })
    const table = new Table({ head })
    table.push(...rows)
    return table.toString()
  },
  markdown: (data) => {
    const { head, rows } = toTable({ data, pick, omit })
    return [
      head,
      head.map(_.constant('--')),
      ...rows
    ].map((row) => `| ${row.join(' | ')} |`).join('\n')
  }
}

const {argv: {
  cache,
  refresh,
  pick,
  omit,
  sort,
  type,
  filter: filterArg,
  output: outputArg
}} = yargs
  .normalize('cache')
  .default('cache', defaultCache)
  .coerce('cache', (arg) => path.resolve(process.cwd(), arg))

  .boolean('refresh')
  .default('refresh', defaultRefresh)

  .coerce('filter', JSON.parse)

  .default('pick', arrayToString(defaultPick))
  .coerce('pick', coerceArray)

  .default('omit', arrayToString(defaultOmit))
  .coerce('omit', coerceArray)

  .default('sort', arrayToString(defaultSort))
  .coerce('sort', coerceArray)

  .choices('output', Object.keys(outputOptions))
  .choices('type', ['relay', 'trail'])
  .help('help')

const filter = !filterArg && type ? { type } : filterArg
const output = outputOptions[outputArg] || _.identity

debug(`Options ${JSON.stringify({ cache, refresh, pick, omit, sort, filter, type, output })}`)

ragnar({ cache, refresh, pick, omit, sort, filter })
  .then((...args) => console.log(output(...args)))
  .catch((...args) => console.error(...args))
