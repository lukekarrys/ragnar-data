const test = require('tape')
const utils = require('../lib/utils')

test('map values numeric', (t) => {
  t.deepEqual(utils.mapValuesNumeric({
    a: {
      b: {
        e: '100',
        f: '-100',
        g: '-100.55',
        h: '100.55'
      },
      c: '-1-800-555-5555',
      d: '1.800.555.5555'
    }
  }), {
    a: {
      b: {
        e: 100,
        f: -100,
        g: -100.55,
        h: 100.55
      },
      c: '-1-800-555-5555',
      d: '1.800.555.5555'
    }
  }, 'values should be changed to numbers')
  t.end()
})

test('map values omit empty', (t) => {
  t.deepEqual(utils.mapValuesOmitEmpty({
    a: {
      b: {
        e: false,
        f: 0,
        g: void 0,
        h: '',
        i: null
      },
      c: 1,
      d: 2
    }
  }), {
    a: {
      b: {
        e: false,
        f: 0,
        h: ''
      },
      c: 1,
      d: 2
    }
  }, 'null, undefined should be omitted')
  t.end()
})

test('deep pick', (t) => {
  t.deepEqual(utils.deepPick({
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: {
        f: {
          g: {
            h: 4,
            i: 5,
            j: 6
          }
        }
      }
    },
    k: [{ l: 10, m: 11 }, { l: 12, m: 13 }, { l: 14, m: 15 }],
    n: [{ o: [{ q: 1, r: 1 }, { q: 1, r: 1 }], p: [{ q: 1, r: 1 }, { q: 1, r: 1 }] }]
  }, ['a', 'c.d', 'c.e.f.g.h', 'c.e.f.g.j', 'k.m', 'n.o.r', 'n.p.q']), {
    a: 1,
    c: {
      d: 3,
      e: {
        f: {
          g: {
            h: 4,
            j: 6
          }
        }
      }
    },
    k: [{ m: 11 }, { m: 13 }, { m: 15 }],
    n: [{ o: [{ r: 1 }, { r: 1 }], p: [{ q: 1 }, { q: 1 }] }]
  })
  t.end()
})

test('deep pick *', (t) => {
  t.deepEqual(utils.deepPick({
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: {
        f: {
          g: {
            h: 4,
            i: 5,
            j: 6
          }
        }
      }
    },
    k: [{ l: 10, m: 11 }, { l: 12, m: 13 }, { l: 14, m: 15 }],
    n: [{ o: [{ q: 1, r: 1 }, { q: 1, r: 1 }], p: [{ q: 1, r: 1 }, { q: 1, r: 1 }] }]
  }, '*'), {
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: {
        f: {
          g: {
            h: 4,
            i: 5,
            j: 6
          }
        }
      }
    },
    k: [{ l: 10, m: 11 }, { l: 12, m: 13 }, { l: 14, m: 15 }],
    n: [{ o: [{ q: 1, r: 1 }, { q: 1, r: 1 }], p: [{ q: 1, r: 1 }, { q: 1, r: 1 }] }]
  })
  t.end()
})

test('deep omit', (t) => {
  t.deepEqual(utils.deepOmit({
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: {
        f: {
          g: {
            h: 4,
            i: 5,
            j: 6
          }
        }
      }
    },
    k: [{ l: 10, m: 11 }, { l: 12, m: 13 }, { l: 14, m: 15 }],
    n: [{ o: [{ q: 1, r: 1 }, { q: 1, r: 1 }], p: [{ q: 1, r: 1 }, { q: 1, r: 1 }] }]
  }, ['a', 'c.d', 'c.e.f.g.h', 'c.e.f.g.j', 'k.m', 'n.o.r', 'n.p.q']), {
    b: 2,
    c: {
      e: {
        f: {
          g: {
            i: 5
          }
        }
      }
    },
    k: [{ l: 10 }, { l: 12 }, { l: 14 }],
    n: [{ o: [{ q: 1 }, { q: 1 }], p: [{ r: 1 }, { r: 1 }] }]
  })
  t.end()
})

test('default at', (t) => {
  t.equal(utils.defaultAt({ a: null }, 'a.b.c.d'), void 0)
  t.equal(utils.defaultAt({ a: null }, 'a.b.c.d', 5), 5)
  t.equal(utils.defaultAt({ a: { b: { c: { d: null } } } }, 'a.b.c.d'), null)
  t.equal(utils.defaultAt({ a: { b: { c: { d: 5 } } } }, 'a.b.c.d', 100), 5)
  t.end()
})

test('table', (t) => {
  t.deepEqual(utils.toTable({
    data: [{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }, { a: 7, b: 8 }]
  }), {
    head: ['A', 'B'],
    rows: [['1', '2'], ['3', '4'], ['5', '6'], ['7', '8']]
  })
  t.end()
})

test('table pick', (t) => {
  t.deepEqual(utils.toTable({
    data: [{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }, { a: 12345.6789, b: 8 }],
    pick: 'a'
  }), {
    head: ['A'],
    rows: [['1'], ['3'], ['5'], ['12,345.68']]
  })
  t.end()
})

test('table omit', (t) => {
  t.deepEqual(utils.toTable({
    data: [{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }, { a: 7, b: 8 }],
    omit: ['a']
  }), {
    head: ['B'],
    rows: [['2'], ['4'], ['6'], ['8']]
  })
  t.end()
})

test('coerce array', (t) => {
  t.deepEqual(utils.coerceArray('a,b,c'), ['a', 'b', 'c'])
  t.deepEqual(utils.coerceArray('a,b,,,,c'), ['a', 'b', 'c'])
  t.deepEqual(utils.coerceArray(['a', 'b', null, null, '', '', 'c']), ['a', 'b', 'c'])
  t.end()
})

test('array to string', (t) => {
  t.deepEqual(utils.arrayToString('ab'), 'ab')
  t.deepEqual(utils.arrayToString('a,b'), 'a,b')
  t.deepEqual(utils.arrayToString(['a', 'b']), 'a,b')
  t.deepEqual(utils.arrayToString(['a', 'b', ['c'], ['d', 'e']]), 'a,b,c,d,e')
  t.end()
})

test('order by params', (t) => {
  t.deepEqual(utils.orderByParams('distance'), [['distance'], []])
  t.deepEqual(utils.orderByParams(['distance']), [['distance'], []])
  t.deepEqual(utils.orderByParams(['distance', 'desc']), [['distance'], ['desc']])
  t.deepEqual(utils.orderByParams(['distance', 'desc', 'elevation']), [['distance', 'elevation'], ['desc']])
  t.deepEqual(utils.orderByParams(['distance', 'desc', 'elevation', 'asc']), [['distance', 'elevation'], ['desc', 'asc']])
  t.deepEqual(utils.orderByParams([['distance'], ['desc']]), [['distance'], ['desc']])
  t.end()
})
