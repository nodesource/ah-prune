# ah-prune [![build status](https://secure.travis-ci.org/nodesource/ah-prune.png)](http://travis-ci.org/nodesource/ah-prune)

Prune specific types of async hook resources from a collected map.

```js
const prune = require('ah-prune')

// Removing all TickObject
const noticks = prune({ activities, prune: new Set([ 'TickObject' ]) })

// Removing everything but TCPWRAP
const onlytcpwrap = prune({ activities, keep: new Set([ 'TCPWRAP' ]) })

// Removing everything but a specific id via a custom keep function
const onlytcp1 = prune({
    activities
  , keepFn(type, activity) { return activity.id === 'tcp:1' }
})
```

## Installation

    npm install ah-prune

## [API](https://nodesource.github.io/ah-prune/)

## License

MIT
