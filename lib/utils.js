const _ = require('lodash')

const toArray = (val) => Array.isArray(val) ? val : [val]

const walk = (obj, {
  key = _.identity,
  value = _.identity,
  separator = '.',
  prefix = '',
  omit,
  pick
} = {}) => {
  if (!obj || typeof obj !== 'object' || _.isDate(obj) || _.isRegExp(obj)) {
    return obj
  }

  const options = (...args) => Object.assign({
    key,
    value,
    separator,
    prefix,
    omit,
    pick
  }, ...args)

  if (Array.isArray(obj)) {
    return obj.map((item) => walk(item, options()))
  }

  return Object.keys(obj).reduce((acc, oldKey) => {
    const parentKey = (prefix && prefix + separator) + oldKey
    const oldValue = obj[oldKey]
    const newValue = value(oldValue, oldKey)
    const newKey = key(oldKey, oldValue)

    const pickIt = pick && pick(oldValue, oldKey, parentKey)
    const dontOmitIt = omit && !omit(oldValue, oldKey, parentKey)
    const defaultIt = !pick && !omit

    if (pickIt || dontOmitIt || defaultIt) {
      acc[newKey] = walk(newValue, options({ prefix: parentKey }))
    }

    return acc
  }, {})
}

const mapValuesNumeric = (obj) => walk(obj, {
  value: (v) => typeof v === 'string' && /^-?\d+\.?\d*$/.test(v) ? +v : v
})

const mapValuesOmitEmpty = (obj) => walk(obj, {
  omit: (v) => v == null
})

const deepOmit = (obj, props, separator = '.') => {
  props = toArray(props)
  return walk(obj, {
    separator,
    omit: (v, k, pk) => props.includes(pk)
  })
}

const deepPick = (obj, props, separator = '.') => {
  props = toArray(props)
  const pick = props.length === 1 && props[0] === '*'
    ? _.stubTrue
    : (v, k, pk) => props.includes(pk) || props.some((p) => p.startsWith(pk + separator))
  return walk(obj, { separator, pick })
}

const defaultAt = (obj, path, def) => {
  const value = _.at(obj, [path])[0]
  return value === undefined ? def : value
}

const mToFt = (m) => m * 3.28084

const toTable = ({ data, pick = Object.keys(data[0]), omit }) => {
  const head = _.without(toArray(pick), ...toArray(omit)).filter((h) => !h.includes('.'))
  const rows = data.map((d) => head.map((p) => defaultAt(d, p, '')))
  return { head: head.map(_.startCase), rows }
}

const coerceArray = (val) => (typeof val === 'string' ? val.split(',') : val).filter(Boolean)
const arrayToString = (arr) => _.flatten(toArray(arr)).join(',')

const orderByParams = (params) => toArray(params).reduce((acc, prop) => {
  let index
  let values
  if (Array.isArray(prop)) {
    index = prop.includes('desc') || prop.includes('asc') ? 1 : 0
    values = prop
  } else {
    index = prop === 'desc' || prop === 'asc' ? 1 : 0
    values = [prop]
  }
  acc[index].push(...values)
  return acc
}, [[], []])

module.exports = {
  mapValuesNumeric,
  mapValuesOmitEmpty,
  deepPick,
  deepOmit,
  defaultAt,
  mToFt,
  toTable,
  coerceArray,
  arrayToString,
  orderByParams
}
