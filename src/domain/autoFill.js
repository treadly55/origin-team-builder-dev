import { POSITION_CATEGORY } from './categories.js'

const BENCH_CATEGORY = {
  14: 'forwards',
  15: 'forwards',
  16: 'forwards',
  17: 'forwards',
  18: 'backs',
  19: 'halves',
}

const REQUIRED = { backs: 6, halves: 3, forwards: 10 }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function autoFillSlots(players, { min = 75, max = 99 } = {}) {
  const pool = { backs: [], halves: [], forwards: [] }
  for (const p of players) {
    if (p.rating < min || p.rating > max) continue
    if (p.eligibleCategories.includes('utility')) {
      pool.backs.push(p.id)
      pool.halves.push(p.id)
      pool.forwards.push(p.id)
      continue
    }
    for (const cat of p.eligibleCategories) {
      if (cat in pool) pool[cat].push(p.id)
    }
  }

  const missing = {}
  for (const cat of Object.keys(REQUIRED)) {
    if (pool[cat].length < REQUIRED[cat]) {
      missing[cat] = REQUIRED[cat] - pool[cat].length
    }
  }
  if (Object.keys(missing).length > 0) {
    return { ok: false, missing }
  }

  const remaining = {
    backs: shuffle(pool.backs),
    halves: shuffle(pool.halves),
    forwards: shuffle(pool.forwards),
  }
  const used = new Set()
  const slots = {}

  const assign = (position, category) => {
    while (remaining[category].length > 0) {
      const id = remaining[category].shift()
      if (used.has(id)) continue
      slots[position] = id
      used.add(id)
      return
    }
  }

  for (let pos = 1; pos <= 13; pos++) assign(pos, POSITION_CATEGORY[pos])
  for (let pos = 14; pos <= 19; pos++) assign(pos, BENCH_CATEGORY[pos])

  return { ok: true, slots }
}
