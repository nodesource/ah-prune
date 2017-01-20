const clone = require('ah-deep-clone')

function shouldKeep({ type,  prune, keep }) {
  if (prune != null) return !prune.has(type)
  if (keep != null) return keep.has(type)
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
 * the pruning step.
 *
 * @name prune
 * @function
 * @param {Object} opts options to configure the pruning step
 * @param {Map.<Object>} opts.activities the activities to be pruned
 * @param {Set.<String>} opts.prune if supplied all activities of types supplied in the Set are removed
 * @param {Set.<String>} opts.keep if supplied all activities of types NOT supplied in the Set are removed
 * @return {Map.<Object>} the pruned activities
 */
module.exports = function prune({ activities, prune, keep }) {
  if (!(activities instanceof Map)) {
    throw new Error('activities must be a Map')
  }
  if (prune == null && keep == null) {
    throw new Error('must supply either prune or keep')
  }
  if (prune != null && keep != null) {
    throw new Error('only prune or keep maybe supplied, not both')
  }
  if (prune != null && !(prune instanceof Set)) {
    throw new TypeError('prune needs to be a Set')
  }
  if (keep != null && !(keep instanceof Set)) {
    throw new TypeError('keep needs to be a Set')
  }

  // ensure we don't affect the original
  activities = clone(activities)

  // remove one object on each pass until none is left anymore
  // not super efficient, but simplest especially to handle
  // multiple objects that need to be pruned in a row
  let foundObject = true

  while (foundObject) {
    foundObject = false
    let objectId = null
    for (const activity of activities.values()) {
      if (shouldKeep({ type: activity.type, prune, keep })) continue
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
