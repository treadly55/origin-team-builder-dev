/**
 * Position categories. Each field position 1..13 belongs to exactly one
 * category. Player eligibility is enforced at the category level.
 */

export const CATEGORIES = ['backs', 'halves', 'forwards', 'utility']

export const CATEGORY_LABELS = {
  backs: 'Backs',
  halves: 'Halves',
  forwards: 'Forwards',
  utility: 'Utility',
}

export const POSITION_CATEGORY = {
  1: 'backs',
  2: 'backs',
  3: 'backs',
  4: 'backs',
  5: 'backs',
  6: 'halves',
  7: 'halves',
  8: 'forwards',
  9: 'forwards',
  10: 'forwards',
  11: 'forwards',
  12: 'forwards',
  13: 'forwards',
}

/**
 * @param {number} position  1..13
 * @returns {'backs'|'halves'|'forwards'|undefined}
 */
export function categoryOf(position) {
  return POSITION_CATEGORY[position]
}
