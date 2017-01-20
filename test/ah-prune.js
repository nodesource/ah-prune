const test = require('tape')
const prune = require('../')

function toMap(array) {
  return array.reduce((map, x) => {
    return map.set(x.id, x)
  }, new Map())
}

// eslint-disable-next-line no-unused-vars
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true))
}

const activities = toMap(
  [ { type: 'TCPWRAP', id: 'tcp:1', triggerId: null },
    { type: 'TickObject', id: 'tickobject:1', triggerId: 'tcp:1' },
    { type: 'TCPWRAP', id: 'tcp:2', triggerId: 'tickobject:1' },
    { type: 'GETADDRINFOREQWRAP',
      id: 'getaddrinforeq:1',
      triggerId: 'tickobject:1' },
    { type: 'TCPCONNECTWRAP',
      id: 'tcpconnect:1',
      triggerId: 'getaddrinforeq:1' },
    { type: 'TCPWRAP', id: 'tcp:3', triggerId: 'tcp:1' },
    { type: 'SHUTDOWNWRAP', id: 'shutdown:1', triggerId: 'tcp:3' },
    { type: 'TickObject', id: 'tickobject:2', triggerId: 'tcp:2' }
  ])

test('\npruning TickObject', function(t) {
  const noticks = prune({ activities, prune: new Set([ 'TickObject' ]) })

  t.deepEqual(Array.from(noticks),
    [ [ 'tcp:1', { type: 'TCPWRAP', id: 'tcp:1', triggerId: null } ],
      [ 'tcp:2',
        { type: 'TCPWRAP', id: 'tcp:2', triggerId: 'tcp:1' } ],
      [ 'getaddrinforeq:1',
        { type: 'GETADDRINFOREQWRAP',
          id: 'getaddrinforeq:1',
          triggerId: 'tcp:1' } ],
      [ 'tcpconnect:1',
        { type: 'TCPCONNECTWRAP',
          id: 'tcpconnect:1',
          triggerId: 'getaddrinforeq:1' } ],
      [ 'tcp:3',
        { type: 'TCPWRAP', id: 'tcp:3', triggerId: 'tcp:1' } ],
      [ 'shutdown:1',
        { type: 'SHUTDOWNWRAP', id: 'shutdown:1', triggerId: 'tcp:3' } ] ]
    , 'removes TickObjects and repoints triggerIds'
  )

  t.end()
})

test('\npruning GETADDRINFOREQWRAP', function(t) {
  const noaddrinfo = prune({ activities, prune: new Set([ 'GETADDRINFOREQWRAP' ]) })
  t.deepEqual(Array.from(noaddrinfo),
    [ [ 'tcp:1', { type: 'TCPWRAP', id: 'tcp:1', triggerId: null } ],
      [ 'tickobject:1',
        { type: 'TickObject', id: 'tickobject:1', triggerId: 'tcp:1' } ],
      [ 'tcp:2',
        { type: 'TCPWRAP', id: 'tcp:2', triggerId: 'tickobject:1' } ],
      [ 'tcpconnect:1',
        { type: 'TCPCONNECTWRAP',
          id: 'tcpconnect:1',
          triggerId: 'tickobject:1' } ],
      [ 'tcp:3',
        { type: 'TCPWRAP', id: 'tcp:3', triggerId: 'tcp:1' } ],
      [ 'shutdown:1',
        { type: 'SHUTDOWNWRAP', id: 'shutdown:1', triggerId: 'tcp:3' } ],
      [ 'tickobject:2',
        { type: 'TickObject', id: 'tickobject:2', triggerId: 'tcp:2' } ] ]
    , 'removes GETADDRINFOWRAP and repoints triggerIds'
  )
  t.end()
})

test('\npruning TickObject and GETADDRINFOREQWRAP', function(t) {
  const noticksOrAddrinfo =
    prune({ activities, prune: new Set([ 'TickObject', 'GETADDRINFOREQWRAP' ]) })

  t.deepEqual(Array.from(noticksOrAddrinfo),
    [ [ 'tcp:1', { type: 'TCPWRAP', id: 'tcp:1', triggerId: null } ],
      [ 'tcp:2',
        { type: 'TCPWRAP', id: 'tcp:2', triggerId: 'tcp:1' } ],
      [ 'tcpconnect:1',
        { type: 'TCPCONNECTWRAP',
          id: 'tcpconnect:1',
          triggerId: 'tcp:1' } ],
      [ 'tcp:3',
        { type: 'TCPWRAP', id: 'tcp:3', triggerId: 'tcp:1' } ],
      [ 'shutdown:1',
        { type: 'SHUTDOWNWRAP', id: 'shutdown:1', triggerId: 'tcp:3' } ] ]
    , 'removes TickObjects and GETADDRINFOWRAP and repoints triggerIds'
  )
  t.end()
})

test('\nkeeping TCPWRAP', function(t) {
  const onlytcpwrap = prune({ activities, keep: new Set([ 'TCPWRAP' ]) })
  t.deepEqual(Array.from(onlytcpwrap),
    [ [ 'tcp:1', { type: 'TCPWRAP', id: 'tcp:1', triggerId: null } ],
      [ 'tcp:2',
        { type: 'TCPWRAP', id: 'tcp:2', triggerId: 'tcp:1' } ],
      [ 'tcp:3',
        { type: 'TCPWRAP', id: 'tcp:3', triggerId: 'tcp:1' } ] ]
    , 'keeps TCPWRAP only and repoints triggerIds'
  )
  t.end()
})
