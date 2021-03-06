const test = require('tape')
const nock = require('nock')
const path = require('path')
const _ = require('lodash')
const ragnar = require('../index')
const constants = require('../lib/constants')

const FIXTURES_PATH = path.resolve(__dirname, 'fixtures')
const getFixture = (f) => require(path.join(FIXTURES_PATH, f))

const mockFixture = (url, code = 200, data) => nock(constants.ragnarUrl)
  .get(url)
  .reply(code, { data: data || getFixture(_.trimStart(url.replace(/\//g, '-'), '-')) })

test('ragnar', (t) => {
  mockFixture('/list/race')
  mockFixture('/get/race/relay/delsol')

  ragnar({
    cache: false,
    filter: { alias: 'delsol' }
  }).then((races) => {
    t.equal(races.length, 1)
    t.equal(races[0].alias, 'delsol')
    t.equal(races[0].distance, 189.9)
    t.equal(races[0].elevation_gain, 5804.589999999998)
    t.equal(nock.activeMocks().length, 0, 'no mocks')
    t.end()
  }).catch(t.end)
})

test('ragnar error', (t) => {
  mockFixture('/list/race')
  mockFixture('/get/race/relay/delsol', 404, { error: 'wtf' })

  ragnar({
    cache: false,
    filter: { alias: 'delsol' }
  }).then(() => {
    t.end(new Error())
  }).catch((err) => {
    t.equal(err.message, 'Request failed with status code 404')
    t.equal(err.response.status, 404)
    t.deepEqual(err.response.data.data, { error: 'wtf' })
    t.equal(nock.activeMocks().length, 0, 'no mocks')
    t.end()
  })
})

test('ragnar can refresh cache', (t) => {
  mockFixture('/list/race')
  mockFixture('/get/race/relay/delsol')

  ragnar({
    cache: FIXTURES_PATH,
    refresh: true,
    filter: { alias: 'delsol' }
  }).then((races) => {
    t.equal(races.length, 1)
    t.equal(races[0].alias, 'delsol')
    t.equal(races[0].distance, 189.9)
    t.equal(races[0].elevation_gain, 5804.589999999998)
    t.equal(nock.activeMocks().length, 0, 'no mocks')
    t.end()
  }).catch(t.end)
})

test('ragnar from cache', (t) => {
  ragnar({
    cache: FIXTURES_PATH,
    filter: { alias: 'delsol' }
  }).then((races) => {
    t.equal(races.length, 1)
    t.equal(races[0].alias, 'delsol')
    t.equal(races[0].distance, 189.9)
    t.equal(races[0].elevation_gain, 5804.589999999998)
    t.equal(nock.activeMocks().length, 0, 'no mocks')
    t.end()
  }).catch(t.end)

  test('ragnar pick', (t) => {
    ragnar({
      cache: FIXTURES_PATH,
      filter: { alias: 'delsol' },
      pick: ['distance', 'elevation_gain']
    }).then((races) => {
      t.equal(races.length, 1)
      t.deepEqual(Object.keys(races[0]), ['distance', 'elevation_gain'])
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar all keys', (t) => {
    ragnar({
      cache: FIXTURES_PATH
    }).then((races) => {
      const expectedKeys = _.uniq(constants.defaultPick.map((p) => p.split('.')[0])).sort()
      races.forEach((r) => t.deepEqual(Object.keys(r).sort(), expectedKeys, r.alias))
      t.equal(races.length, 41)
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar omit', (t) => {
    const omit = ['legs', 'name', 'display_name']
    ragnar({
      cache: FIXTURES_PATH,
      omit
    }).then((races) => {
      const expectedKeys = _.without(constants.defaultPick.filter((p) => !p.includes('.')), ...omit).sort()
      races.forEach((r) => t.deepEqual(Object.keys(r).sort(), expectedKeys, r.alias))
      t.equal(races.length, 41)
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar sort', (t) => {
    ragnar({
      cache: FIXTURES_PATH,
      filter: { type: 'trail' },
      sort: ['elevation_gain', 'desc']
    }).then((races) => {
      t.equal(races.length, 21)
      t.equal(races[0].alias, 'rainier')
      t.equal(races[1].alias, 'los_coyotes_ca')
      t.equal(_.last(races).alias, 'oahu')
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar sort default direction', (t) => {
    ragnar({
      cache: FIXTURES_PATH,
      filter: { type: 'trail' },
      sort: 'elevation_gain'
    }).then((races) => {
      t.equal(races.length, 21)
      t.equal(races[0].alias, 'oahu')
      t.equal(races[races.length - 2].alias, 'los_coyotes_ca')
      t.equal(_.last(races).alias, 'rainier')
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar sort multi', (t) => {
    ragnar({
      cache: FIXTURES_PATH,
      filter: { type: 'trail' },
      sort: ['distance', 'desc', 'elevation_gain', 'desc']
    }).then((races) => {
      t.equal(races.length, 21)
      t.equal(races[1].alias, 'tahoe_ca')
      t.equal(races[2].alias, 'carolinas_sc')
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })

  test('ragnar sort multi with last order by default', (t) => {
    ragnar({
      cache: FIXTURES_PATH,
      filter: { type: 'trail' },
      sort: ['distance', 'desc', 'elevation_gain']
    }).then((races) => {
      t.equal(races.length, 21)
      t.equal(races[1].alias, 'carolinas_sc')
      t.equal(races[2].alias, 'tahoe_ca')
      t.equal(nock.activeMocks().length, 0, 'no mocks')
      t.end()
    }).catch(t.end)
  })
})
