import { seedPlayers } from '../../domain/seedPlayers.js'

const LINEUP_KEY = (id) => `origin-builder:lineup:${id}`
const INDEX_KEY = 'origin-builder:lineup-index'

function newId() {
  return Math.random().toString(36).slice(2, 6)
}

function nowIso() {
  return new Date().toISOString()
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function readIndex() {
  const value = readJson(INDEX_KEY, [])
  return Array.isArray(value) ? value : []
}

function writeIndex(entries) {
  writeJson(INDEX_KEY, entries)
}

function indexEntryFor(lineup) {
  return {
    id: lineup.id,
    name: lineup.name,
    team: lineup.team,
    updatedAt: lineup.updatedAt,
  }
}

function upsertIndexEntry(lineup) {
  const entries = readIndex()
  const next = entries.filter((e) => e.id !== lineup.id)
  next.push(indexEntryFor(lineup))
  writeIndex(next)
}

function removeIndexEntry(id) {
  writeIndex(readIndex().filter((e) => e.id !== id))
}

export const localStorageBackend = {
  async listPlayers(team) {
    return seedPlayers.filter((p) => p.team === team)
  },

  async listLineups() {
    return readIndex()
  },

  async getLineup(id) {
    return readJson(LINEUP_KEY(id), null)
  },

  async createLineup({ team, name }) {
    const timestamp = nowIso()
    const lineup = {
      id: newId(),
      team,
      name,
      slots: {},
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    writeJson(LINEUP_KEY(lineup.id), lineup)
    upsertIndexEntry(lineup)
    return lineup
  },

  async updateLineup(lineup) {
    const next = {
      ...lineup,
      version: (lineup.version ?? 0) + 1,
      updatedAt: nowIso(),
    }
    writeJson(LINEUP_KEY(next.id), next)
    upsertIndexEntry(next)
    return next
  },

  async duplicateLineup(id) {
    const source = readJson(LINEUP_KEY(id), null)
    if (!source) {
      throw new Error(`Lineup ${id} not found`)
    }
    const timestamp = nowIso()
    const copy = {
      ...source,
      id: newId(),
      name: `${source.name} (copy)`,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    writeJson(LINEUP_KEY(copy.id), copy)
    upsertIndexEntry(copy)
    return copy
  },

  async deleteLineup(id) {
    localStorage.removeItem(LINEUP_KEY(id))
    removeIndexEntry(id)
  },
}
