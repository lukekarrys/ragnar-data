const _ = require('lodash')
const axios = require('axios')
const fs = require('fs-promise')
const path = require('path')
const exists = require('fs').existsSync
const debug = require('./debug')('ragnar')

const {
  deepPick,
  deepOmit,
  mapValuesNumeric,
  mapValuesOmitEmpty,
  defaultAt,
  mToFt,
  orderByParams
} = require('./utils')

const {
  defaultPick,
  defaultOmit,
  defaultSort,
  ragnarUrl,
  defaultCache,
  defaultRefresh
} = require('./constants')

const debugList = (type) => (data) => {
  debug(`${type} ${JSON.stringify(_.map(data, 'alias'))}`)
  return data
}

// There was some weirdness I think with races existing in the API without legs
// which is probably a mistake, so never show those
const hasLegs = (race) => defaultAt(race, 'legs[0].distance')

// Get the starting or ending elevation for a race based on its legs
const raceElevation = (race, type) => {
  const legIndex = type === 'start' ? 0 : defaultAt(race, 'legs').length - 1
  const pointIndex = type === 'start' ? 0 : defaultAt(race, `legs[${legIndex}].points`).length - 1
  const elevation = defaultAt(race, `legs[${legIndex}].points[${pointIndex}].ele`, 0)
  return mToFt(elevation)
}

module.exports = ({
  filter = null,
  refresh = defaultRefresh,
  cache = defaultCache,
  pick = defaultPick,
  omit = defaultOmit,
  sort = defaultSort
} = {}) => {
  debug(`Options ${JSON.stringify({ filter, refresh, cache, pick, omit, sort })}`)

  // The path to cache a request based on its url
  const cachePath = (url) => cache && path
    .join(cache, `${_.trimStart(url.replace(/\//g, '-'), '-')}.json`)

  // Fetch data from Ragnar API and cache it if requested
  const fetchData = (url) => axios
    .get(ragnarUrl + url)
    .then((resp) => resp.data.data)
    .then((data) => {
      debug(`Fetched ${url}`)

      if (!cache) return data

      debug(`Caching ${url}`)
      return fs.outputJson(cachePath(url), data, { spaces: 0 }).then(_.constant(data))
    })

  // Get the requsted data either from the cache or API
  const getData = (url) => {
    const urlCache = cachePath(url)
    const hasCache = cache && exists(urlCache)
    const fromCache = hasCache && !refresh
    debug(`${fromCache ? 'Reading from cache' : 'Fetching'} ${url}`)
    return fromCache ? fs.readJson(urlCache) : fetchData(url)
  }

  // Get the individual race data
  const getRace = (race) => getData(`/get/race/${race.type}/${race.alias}`)

  // Massage the raw race data to remove, update, and app props
  const massageRace = (rawRace) => {
    // Make anything that looks numeric, into a number so later calculations work
    const race = mapValuesNumeric(rawRace)
    const distance = _.sumBy(race.legs, 'distance') * (race.type === 'trail' ? 8 : 1)

    // Assign some new properties
    Object.assign(race, {
      distance,
      avg_distance_per_person: distance / (race.type === 'trail' ? 8 : 12),
      elevation_gain: _.sumBy(race.legs, 'elevation_gain'),
      display_name: race.name.replace(/(Reebok|Ragnar|Trail) /g, ''),
      elevation_start: raceElevation(race, 'start'),
      elevation_end: raceElevation(race, 'end')
    })

    // Get rid of undefined/null params and pick/omit only the wanted proops
    return mapValuesOmitEmpty(deepOmit(deepPick(race, pick), omit))
  }

  // Get the list of races
  return getData('/list/race')
    .then(debugList('List races'))
    // Filter first so nothing unwanted is requsted
    .then((races) => _.filter(races, filter))
    .then(debugList('Filtered races'))
    // Request all the individual races
    .then((races) => Promise.all(races.map(getRace)))
    // Filter those for good data and massage data
    .then((races) => races.filter(hasLegs).map(massageRace))
    .then(debugList('Massaged races'))
    // Order it by sort argument
    .then((races) => _.orderBy(races, ...orderByParams(sort)))
    .then(debugList('Ordered races'))
}
