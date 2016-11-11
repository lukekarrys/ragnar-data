const _ = require('lodash')

const walk = (obj, { separator = '.', key = _.identity, value = _.identity, omit } = {}) => {
  if (!obj || typeof obj !== 'object') return obj
  if (_.isDate(obj) || _.isRegExp(obj)) return obj
  if (Array.isArray(obj)) return obj.map((item) => walk(item, { key, value, omit }))
  return Object.keys(obj).reduce((acc, oldKey) => {
    const oldValue = obj[oldKey]
    const newValue = value(oldValue, oldKey)
    const newKey = key(oldKey, oldValue)
    if (!omit || !omit(oldValue, oldKey)) {
      acc[newKey] = walk(newValue, { key, value, omit })
    }
    return acc
  }, {})
}

const numeric = /^\-?[\d\.]+$/
const mapValuesNumeric = (obj) => walk(obj, {
  value: (v) => typeof v === 'string' && numeric.test(v) ? +v : v
})

const mapValuesOmitEmpty = (obj) => walk(obj, {
  omit: (v) => v === '' || v == null
})

const deepPicker = (obj, props, separator = '.', check) => _.transform(obj, (res, value, key) => {
  if (check(props, key)) {
    // Exact match
    res[key] = value
  } else if (typeof key === 'number') {
    // It's an array
    res[key] = deepPicker(value, props, separator, check)
  } else if (props.some((prop) => prop.startsWith(key + separator))) {
    // The props list is looking for a subset of this key
    const subProps = props.filter((prop) => prop.startsWith(key + separator)).map((prop) => prop.replace(key + separator, ''))
    res[key] = deepPicker(value, subProps, separator, check)
  }

  return res
})

const deepPick = (obj, props, separator) => deepPicker(obj, props, separator, (props, key) => props.includes(key))
const deepOmit = (obj, props, separator) => deepPicker(obj, props, separator, (props, key) => !props.includes(key))

const defaultAt = (obj, path, def) => {
  const value = _.at(obj, [path])[0]
  return value === undefined ? def : value
}

module.exports = {
  mapValuesNumeric,
  mapValuesOmitEmpty,
  deepPick,
  deepOmit,
  defaultAt
}
