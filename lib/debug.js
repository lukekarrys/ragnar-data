const debug = require('debug')
const { name } = require('../package.json')

module.exports = (type = '') => debug(name + (type && `:${type}`))
