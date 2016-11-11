const defaultSort = [['distance'], ['desc']]

const defaultProps = [
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
  'elevation_gain',
  'start_elevation',
  'end_elevation',
  'legs.name',
  'legs.difficulty',
  'legs.leg_number',
  'legs.start_point',
  'legs.end_point'
]

module.exports = {
  defaultSort,
  defaultProps
}
