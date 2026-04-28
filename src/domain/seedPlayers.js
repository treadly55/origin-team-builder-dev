/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 * @property {string} club
 * @property {"NSW"|"QLD"} team
 * @property {number[]} eligiblePositions  Integers in 1..13. May be empty.
 * @property {number} rating  0..99
 * @property {string|null} photoUrl  Ignored in v1; silhouette rendered regardless.
 */

/** @type {Player[]} */
export const seedPlayers = [
  // ---------------------------------------------------------------------
  // NSW Blues (28)
  // ---------------------------------------------------------------------

  // Fullbacks
  { id: 'p_001', name: 'Jarrah Whitlock',   club: 'Sydney Harbourhawks',    team: 'NSW', eligiblePositions: [1],         rating: 92, photoUrl: null },
  { id: 'p_002', name: 'Coby Mailata',      club: 'Parramatta Rangers',     team: 'NSW', eligiblePositions: [1, 2, 5],   rating: 84, photoUrl: null },

  // Wingers
  { id: 'p_003', name: 'Rhys Okafor',       club: 'Cronulla Mariners',      team: 'NSW', eligiblePositions: [2, 5],      rating: 89, photoUrl: null },
  { id: 'p_004', name: 'Taj Blackwell',     club: 'Penrith Ironhawks',      team: 'NSW', eligiblePositions: [2, 5],      rating: 87, photoUrl: null },
  { id: 'p_005', name: 'Milo Karamu',       club: 'Newcastle Surge',        team: 'NSW', eligiblePositions: [2, 5, 1],   rating: 82, photoUrl: null },

  // Centres
  { id: 'p_006', name: 'Declan Moretti',    club: 'Sydney Harbourhawks',    team: 'NSW', eligiblePositions: [3, 4],      rating: 90, photoUrl: null },
  { id: 'p_007', name: 'Ebb Talanoa',       club: 'Manly Marlins',          team: 'NSW', eligiblePositions: [3, 4, 5],   rating: 86, photoUrl: null },
  { id: 'p_008', name: 'Hudson Varga',      club: 'St George Dragoons',     team: 'NSW', eligiblePositions: [3, 4],      rating: 81, photoUrl: null },

  // Five-Eighth
  { id: 'p_009', name: 'Orson Blakely',     club: 'Penrith Ironhawks',      team: 'NSW', eligiblePositions: [6],         rating: 93, photoUrl: null },
  { id: 'p_010', name: 'Finley Durst',      club: 'Canterbury Bulldogs XI', team: 'NSW', eligiblePositions: [6, 7],      rating: 85, photoUrl: null },

  // Halfback
  { id: 'p_011', name: 'Kai Dimitriou',     club: 'South Sydney Saints',    team: 'NSW', eligiblePositions: [7],         rating: 91, photoUrl: null },
  { id: 'p_012', name: 'Jonty Ellsworth',   club: 'Wests Titans',           team: 'NSW', eligiblePositions: [7, 6],      rating: 83, photoUrl: null },

  // Props
  { id: 'p_013', name: 'Bomber Huakau',     club: 'Newcastle Surge',        team: 'NSW', eligiblePositions: [8, 10],     rating: 88, photoUrl: null },
  { id: 'p_014', name: 'Remi Czajkowski',   club: 'Penrith Ironhawks',      team: 'NSW', eligiblePositions: [8, 10],     rating: 86, photoUrl: null },
  { id: 'p_015', name: "Tane Fotuali'i",    club: 'Parramatta Rangers',     team: 'NSW', eligiblePositions: [8, 10, 13], rating: 80, photoUrl: null },
  { id: 'p_016', name: 'Axl Brennan',       club: 'Sydney Harbourhawks',    team: 'NSW', eligiblePositions: [8, 10],     rating: 75, photoUrl: null },

  // Hooker
  { id: 'p_017', name: 'Wiremu Harlow',     club: 'Manly Marlins',          team: 'NSW', eligiblePositions: [9],         rating: 90, photoUrl: null },
  { id: 'p_018', name: 'Teddy Ngatai',      club: 'Cronulla Mariners',      team: 'NSW', eligiblePositions: [9, 13],     rating: 78, photoUrl: null },

  // Second Row
  { id: 'p_019', name: 'Brock Ivanović',    club: 'St George Dragoons',     team: 'NSW', eligiblePositions: [11, 12],     rating: 89, photoUrl: null },
  { id: 'p_020', name: 'Jaxon Peretola',    club: 'Canterbury Bulldogs XI', team: 'NSW', eligiblePositions: [11, 12, 13], rating: 85, photoUrl: null },
  { id: 'p_021', name: 'Huxley Rath',       club: 'South Sydney Saints',    team: 'NSW', eligiblePositions: [11, 12],     rating: 79, photoUrl: null },

  // Lock
  { id: 'p_022', name: 'Arlo Penitoa',      club: 'Wests Titans',           team: 'NSW', eligiblePositions: [13],         rating: 87, photoUrl: null },
  { id: 'p_023', name: 'Nikau Delacroix',   club: 'Penrith Ironhawks',      team: 'NSW', eligiblePositions: [13, 11, 12], rating: 82, photoUrl: null },

  // Fringe / depth
  { id: 'p_024', name: 'Sam Oriti',         club: 'Newcastle Surge',        team: 'NSW', eligiblePositions: [1, 6],       rating: 73, photoUrl: null },
  { id: 'p_025', name: 'Callum Rasputin',   club: 'Manly Marlins',          team: 'NSW', eligiblePositions: [2, 5],       rating: 71, photoUrl: null },
  { id: 'p_026', name: 'Perry Sundqvist',   club: 'Parramatta Rangers',     team: 'NSW', eligiblePositions: [3, 4],       rating: 70, photoUrl: null },
  { id: 'p_027', name: 'Mack Ovaltine',     club: 'Cronulla Mariners',      team: 'NSW', eligiblePositions: [8, 10],      rating: 72, photoUrl: null },
  { id: 'p_028', name: 'Zed Marchetti',     club: 'Sydney Harbourhawks',    team: 'NSW', eligiblePositions: [11, 12, 13], rating: 68, photoUrl: null },

  // ---------------------------------------------------------------------
  // QLD Maroons (28)
  // ---------------------------------------------------------------------

  // Fullbacks
  { id: 'p_029', name: 'Kobe Vakameilalo',  club: 'Brisbane Thunderhawks',  team: 'QLD', eligiblePositions: [1],          rating: 94, photoUrl: null },
  { id: 'p_030', name: 'Denver Mahuta',     club: 'Gold Coast Rays',        team: 'QLD', eligiblePositions: [1, 6],       rating: 83, photoUrl: null },

  // Wingers
  { id: 'p_031', name: 'Tupou Sisifa',      club: 'North Qld Tidemen',      team: 'QLD', eligiblePositions: [2, 5],       rating: 91, photoUrl: null },
  { id: 'p_032', name: 'Boston Kealoha',    club: 'Redcliffe Ember',        team: 'QLD', eligiblePositions: [2, 5],       rating: 86, photoUrl: null },
  { id: 'p_033', name: 'Quincy Mfume',      club: 'Sunshine Coast Aces',    team: 'QLD', eligiblePositions: [2, 5, 1],    rating: 81, photoUrl: null },

  // Centres
  { id: 'p_034', name: 'Elias Konstantinou', club: 'Brisbane Thunderhawks', team: 'QLD', eligiblePositions: [3, 4],       rating: 89, photoUrl: null },
  { id: 'p_035', name: 'Matai Halaholo',    club: 'Ipswich Pioneers',       team: 'QLD', eligiblePositions: [3, 4, 2],    rating: 85, photoUrl: null },
  { id: 'p_036', name: 'Dashiell Okonkwo',  club: 'Gold Coast Rays',        team: 'QLD', eligiblePositions: [3, 4],       rating: 82, photoUrl: null },

  // Five-Eighth
  { id: 'p_037', name: 'Beau Fonoti',       club: 'Redcliffe Ember',        team: 'QLD', eligiblePositions: [6],          rating: 92, photoUrl: null },
  { id: 'p_038', name: 'Hamilton Jarvis',   club: 'Townsville Stormcaps',   team: 'QLD', eligiblePositions: [6, 7],       rating: 84, photoUrl: null },

  // Halfback
  { id: 'p_039', name: 'Rafferty Lindgren', club: 'Brisbane Thunderhawks',  team: 'QLD', eligiblePositions: [7],          rating: 93, photoUrl: null },
  { id: 'p_040', name: 'Otis Nakamura',     club: 'Gold Coast Rays',        team: 'QLD', eligiblePositions: [7, 6],       rating: 82, photoUrl: null },

  // Props
  { id: 'p_041', name: 'Viliami Kauhaka',   club: 'North Qld Tidemen',      team: 'QLD', eligiblePositions: [8, 10],      rating: 90, photoUrl: null },
  { id: 'p_042', name: 'Tobias Rendall',    club: 'Brisbane Thunderhawks',  team: 'QLD', eligiblePositions: [8, 10],      rating: 87, photoUrl: null },
  { id: 'p_043', name: 'Jedda Winterbourne', club: 'Ipswich Pioneers',      team: 'QLD', eligiblePositions: [8, 10, 13],  rating: 81, photoUrl: null },
  { id: 'p_044', name: 'Ollie Kahananui',   club: 'Sunshine Coast Aces',    team: 'QLD', eligiblePositions: [8, 10],      rating: 76, photoUrl: null },

  // Hooker
  { id: 'p_045', name: 'Archie Pendergast', club: 'Redcliffe Ember',        team: 'QLD', eligiblePositions: [9],          rating: 91, photoUrl: null },
  { id: 'p_046', name: "Niko Fa'asoa",      club: 'Townsville Stormcaps',   team: 'QLD', eligiblePositions: [9, 13],      rating: 77, photoUrl: null },

  // Second Row
  { id: 'p_047', name: 'Cruz Ivanisevic',   club: 'Brisbane Thunderhawks',  team: 'QLD', eligiblePositions: [11, 12],     rating: 88, photoUrl: null },
  { id: 'p_048', name: 'Blake Ormsby',      club: 'Gold Coast Rays',        team: 'QLD', eligiblePositions: [11, 12, 13], rating: 86, photoUrl: null },
  { id: 'p_049', name: 'Ronan Takiwa',      club: 'North Qld Tidemen',      team: 'QLD', eligiblePositions: [11, 12],     rating: 80, photoUrl: null },

  // Lock
  { id: 'p_050', name: 'Louka Petrov',      club: 'Ipswich Pioneers',       team: 'QLD', eligiblePositions: [13],         rating: 88, photoUrl: null },
  { id: 'p_051', name: 'Flynn Moananu',     club: 'Redcliffe Ember',        team: 'QLD', eligiblePositions: [13, 11, 12], rating: 83, photoUrl: null },

  // Fringe / depth
  { id: 'p_052', name: 'Jasper Okafor',     club: 'Sunshine Coast Aces',    team: 'QLD', eligiblePositions: [1, 6],       rating: 72, photoUrl: null },
  { id: 'p_053', name: 'Huon Greaves',      club: 'Townsville Stormcaps',   team: 'QLD', eligiblePositions: [2, 5],       rating: 70, photoUrl: null },
  { id: 'p_054', name: 'Thierry Labuschagne', club: 'Gold Coast Rays',      team: 'QLD', eligiblePositions: [3, 4],       rating: 71, photoUrl: null },
  { id: 'p_055', name: 'Barnaby Tualau',    club: 'Ipswich Pioneers',       team: 'QLD', eligiblePositions: [8, 10],      rating: 73, photoUrl: null },
  { id: 'p_056', name: 'Xavier Ngawati',    club: 'Brisbane Thunderhawks',  team: 'QLD', eligiblePositions: [11, 12, 13], rating: 69, photoUrl: null },
]
