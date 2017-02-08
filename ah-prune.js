const clone = require('ah-deep-clone')

function shouldKeep({ type, activity, prune, keep, keepFn }) {
  if (prune != null) return !prune.has(type)
  if (keep != null) return keep.has(type)
  if (keepFn != null) return keepFn(type, activity)
}

/**
 * Prunes the supplied async hook activities according to `prune` or
 * `keep` option.
 * It repoints the triggerIds in the process so that the graph is
 * preserved.
 *
 * Only either `prune` or `keep` maybe supplied at once.
 *
 * The `activities` passed are not modified, instead a clone is made before
 * the pruning step, unless `copy` is set to `false`
 *
 * @name prune
 * @function
 * @param {Object} $0 options to configure the pruning step
 *
 * @param {Map.<Object>} $0.activities the activities to be pruned
 *
 * @param {Set.<String>} $0.prune if supplied all activities of types supplied
 * in the Set are removed
 *
 * @param {Set.<String>} $0.keep if supplied all activities of types NOT
 * supplied in the Set are removed
 *
 * @param {function} $0.keepFn `function (type, activity)` if supplied will be
 * used as the predicate function to determine if an activity is removed.
 * Return `true` to keep the activity, `false` to remove it
 *
 * @param {Boolean} $0.copy if set, the activities are cloned before
 * modification, otherwise they are modified in place, default: `true`
 *
 * @return {Map.<Object>} the pruned activities
 */
module.exports = function prune({ activities, prune, keep, keepFn, copy = true }) {
  if (!(activities instanceof Map)) {
    throw new Error('activities must be a Map')
  }
  if (prune == null && keep == null && keepFn == null) {
    throw new Error('must supply either prune, keep or keepFn')
  }
  if ((prune != null && keep != null) || (prune != null && keepFn != null)) {
    throw new Error('only prune, keep or keepFn maybe supplied, not more than one')
  }
  if (prune != null && !(prune instanceof Set)) {
    throw new TypeError('prune needs to be a Set')
  }
  if (keep != null && !(keep instanceof Set)) {
    throw new TypeError('keep needs to be a Set')
  }

  if (keepFn != null && typeof keepFn !== 'function') {
    throw new TypeError('keepFn needs to be a function')
  }

  // ensure we don't affect the original
  if (copy) activities = clone(activities)

  // remove one object on each pass until none is left anymore
  // not super efficient, but simplest especially to handle
  // multiple objects that need to be pruned in a row
  let foundObject = true

  while (foundObject) {
    foundObject = false
    let objectId = null
    for (const activity of activities.values()) {
      if (shouldKeep({ type: activity.type, activity, prune, keep, keepFn })) continue
      objectId = activity.id
      break
    }

    if (objectId != null) {
      foundObject = true

      // point all triggerIds that point to the object we are removing
      // to its triggerId and finally remove it from the activities
      const toprune = activities.get(objectId)
      const newTriggerId = toprune.triggerId
      const oldTriggerId = toprune.id

      for (const activity of activities.values()) {
        if (activity.triggerId === oldTriggerId) activity.triggerId = newTriggerId
      }
      activities.delete(objectId)
    }
  }
  return activities
}
