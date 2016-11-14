const { name } = require('../package.json')
const envPaths = require('env-paths')

const defaultSort = ['distance', 'desc']

const defaultPick = [
  'type',
  'alias',
  'name',
  'display_name',
  'start_city',
  'start_state',
  'end_city',
  'end_state',
  'country',
  'lat',
  'lng',
  'start_date',
  'end_date',
  'distance',
  'avg_distance_per_person',
  'elevation_gain',
  'elevation_start',
  'elevation_end',
  'legs.name',
  'legs.difficulty',
  'legs.leg_number',
  'legs.start_point',
  'legs.end_point'
]

module.exports = {
  defaultSort,
  defaultPick,
  defaultCache: envPaths(name).cache,
  defaultOmit: [],
  defaultRefresh: false,
  ragnarUrl: 'https://api.runragnar.com'
}
