import { supabase } from '../supabase.js'

function rowToLineup(row) {
  return {
    id: row.id,
    team: row.team,
    name: row.name,
    slots: row.slots,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToLineupSummary(row) {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    updatedAt: row.updated_at,
  }
}

function rowToPlayer(row) {
  return {
    id: row.id,
    name: row.name,
    club: row.club,
    team: row.team,
    eligibleCategories: row.eligible_categories,
    rating: row.rating,
    speed: row.speed,
    endurance: row.endurance,
    defence: row.defence,
    workrate: row.workrate,
    photoUrl: row.photo_url,
  }
}

export const supabaseBackend = {
  async listPlayers(team) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team', team)
      .order('rating', { ascending: false })
    if (error) throw error
    return data.map(rowToPlayer)
  },

  async listLineups() {
    const { data, error } = await supabase
      .from('lineups')
      .select('id, name, team, updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data.map(rowToLineupSummary)
  },

  async getLineup(id) {
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? rowToLineup(data) : null
  },

  async createLineup({ team, name, slots = {} }) {
    const { data, error } = await supabase
      .from('lineups')
      .insert({ team, name, slots })
      .select()
      .single()
    if (error) throw error
    return rowToLineup(data)
  },

  async updateLineup(lineup) {
    const { data, error } = await supabase
      .from('lineups')
      .update({
        name: lineup.name,
        slots: lineup.slots,
        version: (lineup.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lineup.id)
      .select()
      .single()
    if (error) throw error
    return rowToLineup(data)
  },

  async duplicateLineup(id) {
    const { data: source, error: fetchError } = await supabase
      .from('lineups')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError
    const { data, error } = await supabase
      .from('lineups')
      .insert({
        team: source.team,
        name: `${source.name} (copy)`,
        slots: source.slots,
      })
      .select()
      .single()
    if (error) throw error
    return rowToLineup(data)
  },

  async deleteLineup(id) {
    const { error } = await supabase.from('lineups').delete().eq('id', id)
    if (error) throw error
  },
}
