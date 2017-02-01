# ah-prune [![build status](https://secure.travis-ci.org/nodesource/ah-prune.png)](http://travis-ci.org/nodesource/ah-prune)

Prune specific types of async hook resources from a collected map.

```js
const prune = require('ah-prune')

// Removing all TickObject
const noticks = prune({ activities, prune: new Set([ 'TickObject' ]) })

// Removing everything but TCPWRAP
const onlytcpwrap = prune({ activities, keep: new Set([ 'TCPWRAP' ]) })
```

## Installation

    npm install ah-prune

## API

### `prune({ activities[, prune, keep ] })`

Prunes the supplied async hook activities according to `prune` or
`keep` option.

It repoints the triggerIds in the process so that the graph is
preserved.

Only either `prune` or `keep` maybe supplied at once.

The `activities` passed are not modified, instead a clone is made before
the pruning step, unless `copy` is set to `false`

#### arguments

- `@param {Object} opts` options to configure the pruning step
- `@param {Map.<Object>} opts.activities` the activities to be pruned
- `@param {Set.<String>} opts.prune` if supplied all activities of types supplied in the Set are removed
- `@param {Set.<String>} opts.keep` if supplied all activities of types NOT supplied in the Set are removed
- `@param {Boolean} opts.copy` if set, the activities are cloned before modification, otherwise they are modified in
  place, default: `true`
- `@return {Map.<Object>}` the pruned activities

## License

MIT
