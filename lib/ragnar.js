const _ = require('lodash')
const axios = require('axios')
const fs = require('fs-promise')
const path = require('path')
const exists = require('fs').existsSync
const { deepPick, deepOmit, mapValuesNumeric, mapValuesOmitEmpty, defaultAt } = require('./utils')
const { defaultPick, defaultOmit, defaultSort } = require('./constants')

const LIST_URL = 'https://api.runragnar.com/list/race'
const RACE_URL = (race) => `https://api.runragnar.com/get/race/${race.type}/${race.alias}`

const getRagnarData = (url) => axios.get(url).then((response) => response.data.data)
const mToFt = (m) => m * 3.28084

const cacheRacePath = (race) => path.join(process.cwd(), '.data', `${race.alias}.json`)
const cacheRace = (race) => fs.outputJson(cacheRacePath(race), race).then(() => race)
const fetchRace = (race) => getRagnarData(RACE_URL(race)).then(cacheRace)
const getRace = (cache) => (race) => cache && exists(cacheRacePath(race)) ? fs.readJson(cacheRacePath(race)) : fetchRace(race)

const getFilteredRaces = ({ cache, filter }) => (races) => Promise.all(_.filter(races, filter).map(getRace(cache)))
const mapRaces = (options) => (races) => races.filter(hasLegs).map(mapRace(options))
const sortRaces = ({ sort }) => (races) => _.orderBy(races, ...sort)

const hasLegs = (race) => defaultAt(race, 'legs[0].distance')
const raceElevation = (race, type) => {
  const legIndex = type === 'start' ? 0 : defaultAt(race, 'legs').length - 1
  const pointIndex = type === 'start' ? 0 : defaultAt(race, `legs[${legIndex}].points`).length - 1
  const elevation = defaultAt(race, `legs[${legIndex}].points[${pointIndex}].ele`, 0)
  return _.round(mToFt(elevation), 2)
}

const mapRace = ({ pick, omit }) => (race) => {
  race = mapValuesNumeric(race)

  race = Object.assign(race, {
    distance: _.round(_.sumBy(race.legs, 'distance'), 2),
    elevation_gain: _.round(_.sumBy(race.legs, 'elevation_gain'), 2),
    display_name: race.name.replace(/(Reebok|Ragnar|Trail) /g, ''),
    elevation_start: raceElevation(race, 'start'),
    elevation_end: raceElevation(race, 'end')
  })

  return mapValuesOmitEmpty(deepOmit(deepPick(race, pick), omit))
}

module.exports = ({
  filter = null,
  cache = true,
  pick = defaultPick,
  omit = defaultOmit,
  sort = defaultSort
} = {}) =>
  getRagnarData(LIST_URL)
    .then(getFilteredRaces({ cache, filter }))
    .then(mapRaces({ pick, omit }))
    .then(sortRaces({ sort }))
