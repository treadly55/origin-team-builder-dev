/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 * @property {string} club
 * @property {"NSW"|"QLD"} team
 * @property {Array<"backs"|"halves"|"forwards">} eligibleCategories  Subset of CATEGORIES. May be empty.
 * @property {number} rating  0..99
 * @property {number} speed  0..99
 * @property {number} endurance  0..99
 * @property {number} defence  0..99
 * @property {number} workrate  0..99
 * @property {string|null} photoUrl  Ignored in v1; silhouette rendered regardless.
 */

/** @type {Player[]} */
export const seedPlayers = [
  // ---------------------------------------------------------------------
  // NSW Blues (56)
  // ---------------------------------------------------------------------

  // Fullbacks
  { id: 'p_001', name: 'Jarrah Whitlock',   club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['backs'],            rating: 92, speed:  5, endurance: 38, defence: 77, workrate: 31, photoUrl: null },
  { id: 'p_002', name: 'Coby Mailata',      club: 'Parramatta Rangers',     team: 'NSW', eligibleCategories: ['backs'],            rating: 84, speed: 68, endurance: 31, defence: 53, workrate: 27, photoUrl: null },
  { id: 'p_059', name: 'Lennox Whitcombe',  club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['backs'],            rating: 88, speed: 20, endurance: 12, defence: 53, workrate: 48, photoUrl: null },
  { id: 'p_060', name: 'Otis Brennan',      club: 'Wests Titans',           team: 'NSW', eligibleCategories: ['backs'],            rating: 76, speed: 44, endurance: 35, defence: 96, workrate: 23, photoUrl: null },

  // Wingers
  { id: 'p_003', name: 'Rhys Okafor',       club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['backs'],            rating: 89, speed: 46, endurance: 51, defence: 30, workrate: 37, photoUrl: null },
  { id: 'p_004', name: 'Taj Blackwell',     club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['backs'],            rating: 87, speed: 53, endurance: 74, defence: 39, workrate: 64, photoUrl: null },
  { id: 'p_005', name: 'Milo Karamu',       club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['backs'],            rating: 82, speed: 47, endurance: 59, defence: 87, workrate: 93, photoUrl: null },
  { id: 'p_061', name: 'Atticus Pareora',   club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['backs'],            rating: 85, speed: 36, endurance: 33, defence: 84, workrate: 66, photoUrl: null },
  { id: 'p_062', name: 'Vasco Tagaloa',     club: 'St George Dragoons',     team: 'NSW', eligibleCategories: ['backs'],            rating: 80, speed: 41, endurance: 25, defence: 59, workrate: 81, photoUrl: null },
  { id: 'p_063', name: 'Cassius Mahoney',   club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['backs'],            rating: 77, speed: 41, endurance: 76, defence: 25, workrate: 24, photoUrl: null },

  // Centres
  { id: 'p_006', name: 'Declan Moretti',    club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['backs'],            rating: 90, speed: 33, endurance: 28, defence: 42, workrate: 46, photoUrl: null },
  { id: 'p_007', name: 'Ebb Talanoa',       club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['backs'],            rating: 86, speed: 22, endurance:  1, defence: 12, workrate: 86, photoUrl: null },
  { id: 'p_008', name: 'Hudson Varga',      club: 'St George Dragoons',     team: 'NSW', eligibleCategories: ['backs'],            rating: 81, speed: 39, endurance:  8, defence: 95, workrate: 77, photoUrl: null },
  { id: 'p_064', name: 'Indigo Faiumu',     club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['backs'],            rating: 88, speed: 88, endurance: 19, defence: 98, workrate:  6, photoUrl: null },
  { id: 'p_065', name: 'Talon Beresford',   club: 'Canterbury Bulldogs XI', team: 'NSW', eligibleCategories: ['backs'],            rating: 83, speed:  8, endurance: 70, defence: 99, workrate:  6, photoUrl: null },
  { id: 'p_066', name: 'Quill Henare',      club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['backs'],            rating: 78, speed: 51, endurance: 52, defence:  5, workrate:  0, photoUrl: null },

  // Five-Eighth
  { id: 'p_009', name: 'Orson Blakely',     club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['halves'],           rating: 93, speed: 58, endurance: 79, defence:  2, workrate: 33, photoUrl: null },
  { id: 'p_010', name: 'Finley Durst',      club: 'Canterbury Bulldogs XI', team: 'NSW', eligibleCategories: ['halves'],           rating: 85, speed: 40, endurance: 58, defence: 87, workrate: 31, photoUrl: null },
  { id: 'p_067', name: 'Bodhi McRae',       club: 'Parramatta Rangers',     team: 'NSW', eligibleCategories: ['halves'],           rating: 87, speed: 29, endurance: 87, defence: 17, workrate: 27, photoUrl: null },
  { id: 'p_068', name: 'Jett Solomona',     club: 'South Sydney Saints',    team: 'NSW', eligibleCategories: ['halves'],           rating: 76, speed: 79, endurance: 42, defence: 74, workrate: 25, photoUrl: null },

  // Halfback
  { id: 'p_011', name: 'Kai Dimitriou',     club: 'South Sydney Saints',    team: 'NSW', eligibleCategories: ['halves'],           rating: 91, speed: 51, endurance: 25, defence: 66, workrate: 40, photoUrl: null },
  { id: 'p_012', name: 'Jonty Ellsworth',   club: 'Wests Titans',           team: 'NSW', eligibleCategories: ['halves'],           rating: 83, speed: 60, endurance: 51, defence: 36, workrate:  0, photoUrl: null },
  { id: 'p_057', name: 'Beck Holloway',     club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['halves'],           rating: 79, speed: 49, endurance:  6, defence: 65, workrate: 96, photoUrl: null },
  { id: 'p_058', name: 'Sully Tamatoa',     club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['halves'],           rating: 76, speed: 31, endurance: 98, defence: 95, workrate: 18, photoUrl: null },

  // Props
  { id: 'p_013', name: 'Bomber Huakau',     club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['forwards'],         rating: 88, speed: 46, endurance: 36, defence: 38, workrate: 68, photoUrl: null },
  { id: 'p_014', name: 'Remi Czajkowski',   club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 86, speed: 96, endurance: 85, defence: 54, workrate: 52, photoUrl: null },
  { id: 'p_015', name: "Tane Fotuali'i",    club: 'Parramatta Rangers',     team: 'NSW', eligibleCategories: ['forwards'],         rating: 80, speed:  7, endurance: 66, defence: 52, workrate: 80, photoUrl: null },
  { id: 'p_016', name: 'Axl Brennan',       club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['forwards'],         rating: 75, speed: 31, endurance:  1, defence: 83, workrate: 13, photoUrl: null },
  { id: 'p_069', name: 'Mateo Pohatu',      club: 'Wests Titans',           team: 'NSW', eligibleCategories: ['forwards'],         rating: 89, speed: 54, endurance: 65, defence: 63, workrate: 54, photoUrl: null },
  { id: 'p_070', name: 'Hawk Kalonji',      club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['forwards'],         rating: 84, speed: 47, endurance: 66, defence: 80, workrate: 12, photoUrl: null },
  { id: 'p_071', name: 'Romeo Sefuiva',     club: 'St George Dragoons',     team: 'NSW', eligibleCategories: ['forwards'],         rating: 79, speed: 52, endurance: 25, defence: 27, workrate: 15, photoUrl: null },
  { id: 'p_072', name: 'Knox Beauregard',   club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 77, speed: 90, endurance: 74, defence: 52, workrate: 50, photoUrl: null },

  // Hooker
  { id: 'p_017', name: 'Wiremu Harlow',     club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['forwards'],         rating: 90, speed: 56, endurance: 61, defence: 76, workrate: 76, photoUrl: null },
  { id: 'p_018', name: 'Teddy Ngatai',      club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 78, speed: 20, endurance: 22, defence: 95, workrate: 10, photoUrl: null },
  { id: 'p_073', name: 'Sonny Vainikolo',   club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['forwards'],         rating: 86, speed: 97, endurance: 63, defence: 19, workrate: 53, photoUrl: null },
  { id: 'p_074', name: 'Pip Tarrant',       club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 76, speed: 65, endurance: 50, defence: 54, workrate: 61, photoUrl: null },

  // Second Row
  { id: 'p_019', name: 'Brock Ivanović',    club: 'St George Dragoons',     team: 'NSW', eligibleCategories: ['forwards'],         rating: 89, speed:  7, endurance: 45, defence: 62, workrate: 79, photoUrl: null },
  { id: 'p_020', name: 'Jaxon Peretola',    club: 'Canterbury Bulldogs XI', team: 'NSW', eligibleCategories: ['forwards'],         rating: 85, speed: 98, endurance:  0, defence:  5, workrate: 38, photoUrl: null },
  { id: 'p_021', name: 'Huxley Rath',       club: 'South Sydney Saints',    team: 'NSW', eligibleCategories: ['forwards'],         rating: 79, speed: 38, endurance: 15, defence: 45, workrate: 64, photoUrl: null },
  { id: 'p_075', name: 'Atlas Mateo',       club: 'Canterbury Bulldogs XI', team: 'NSW', eligibleCategories: ['forwards'],         rating: 87, speed: 11, endurance: 26, defence: 17, workrate: 53, photoUrl: null },
  { id: 'p_076', name: 'Cobalt Rangihau',   club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['forwards'],         rating: 82, speed: 17, endurance: 85, defence: 82, workrate: 99, photoUrl: null },
  { id: 'p_077', name: 'Maverick Liufau',   club: 'Parramatta Rangers',     team: 'NSW', eligibleCategories: ['forwards'],         rating: 76, speed:  4, endurance: 27, defence: 32, workrate: 59, photoUrl: null },

  // Lock
  { id: 'p_022', name: 'Arlo Penitoa',      club: 'Wests Titans',           team: 'NSW', eligibleCategories: ['forwards'],         rating: 87, speed: 42, endurance: 83, defence: 30, workrate: 63, photoUrl: null },
  { id: 'p_023', name: 'Nikau Delacroix',   club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 82, speed: 66, endurance: 98, defence: 71, workrate: 28, photoUrl: null },
  { id: 'p_078', name: 'Halcyon Tupaea',    club: 'South Sydney Saints',    team: 'NSW', eligibleCategories: ['forwards'],         rating: 85, speed: 39, endurance: 46, defence: 64, workrate: 57, photoUrl: null },
  { id: 'p_079', name: 'Forest Aitumua',    club: 'Wests Titans',           team: 'NSW', eligibleCategories: ['forwards'],         rating: 78, speed: 24, endurance: 97, defence: 67, workrate:  8, photoUrl: null },

  // Fringe / depth
  { id: 'p_024', name: 'Sam Oriti',         club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['backs', 'halves'],  rating: 73, speed: 70, endurance: 37, defence: 71, workrate: 65, photoUrl: null },
  { id: 'p_025', name: 'Callum Rasputin',   club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['backs'],            rating: 71, speed: 70, endurance: 63, defence: 77, workrate: 14, photoUrl: null },
  { id: 'p_026', name: 'Perry Sundqvist',   club: 'Parramatta Rangers',     team: 'NSW', eligibleCategories: ['backs'],            rating: 70, speed: 37, endurance: 44, defence: 44, workrate: 26, photoUrl: null },
  { id: 'p_027', name: 'Mack Ovaltine',     club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 72, speed: 71, endurance: 75, defence: 15, workrate: 15, photoUrl: null },
  { id: 'p_028', name: 'Zed Marchetti',     club: 'Sydney Harbourhawks',    team: 'NSW', eligibleCategories: ['forwards'],         rating: 68, speed: 13, endurance: 93, defence: 80, workrate: 20, photoUrl: null },
  { id: 'p_080', name: 'River Sefika',      club: 'Manly Marlins',          team: 'NSW', eligibleCategories: ['backs', 'halves'],  rating: 74, speed: 27, endurance: 67, defence: 70, workrate: 18, photoUrl: null },
  { id: 'p_081', name: 'Ash Korovata',      club: 'St George Dragoons',     team: 'NSW', eligibleCategories: ['backs'],            rating: 72, speed: 35, endurance: 88, defence: 83, workrate: 88, photoUrl: null },
  { id: 'p_082', name: 'Theo Vakauta',      club: 'Cronulla Mariners',      team: 'NSW', eligibleCategories: ['halves'],           rating: 70, speed: 11, endurance: 99, defence:  4, workrate: 34, photoUrl: null },
  { id: 'p_083', name: 'Boon Kelekolio',    club: 'Penrith Ironhawks',      team: 'NSW', eligibleCategories: ['forwards'],         rating: 69, speed: 15, endurance: 77, defence: 46, workrate:  9, photoUrl: null },
  { id: 'p_084', name: 'Wolfe Mariota',     club: 'Newcastle Surge',        team: 'NSW', eligibleCategories: ['forwards'],         rating: 67, speed: 24, endurance: 94, defence: 14, workrate: 60, photoUrl: null },

  // ---------------------------------------------------------------------
  // QLD Maroons (28)
  // ---------------------------------------------------------------------

  // Fullbacks
  { id: 'p_029', name: 'Kobe Vakameilalo',  club: 'Brisbane Thunderhawks',  team: 'QLD', eligibleCategories: ['backs'],            rating: 94, speed: 62, endurance: 53, defence: 91, workrate: 63, photoUrl: null },
  { id: 'p_030', name: 'Denver Mahuta',     club: 'Gold Coast Rays',        team: 'QLD', eligibleCategories: ['backs', 'halves'],  rating: 83, speed: 21, endurance: 38, defence: 73, workrate: 39, photoUrl: null },

  // Wingers
  { id: 'p_031', name: 'Tupou Sisifa',      club: 'North Qld Tidemen',      team: 'QLD', eligibleCategories: ['backs'],            rating: 91, speed: 84, endurance: 52, defence:  8, workrate:  6, photoUrl: null },
  { id: 'p_032', name: 'Boston Kealoha',    club: 'Redcliffe Ember',        team: 'QLD', eligibleCategories: ['backs'],            rating: 86, speed: 32, endurance: 21, defence: 76, workrate: 71, photoUrl: null },
  { id: 'p_033', name: 'Quincy Mfume',      club: 'Sunshine Coast Aces',    team: 'QLD', eligibleCategories: ['backs'],            rating: 81, speed: 22, endurance: 78, defence: 22, workrate: 57, photoUrl: null },

  // Centres
  { id: 'p_034', name: 'Elias Konstantinou', club: 'Brisbane Thunderhawks', team: 'QLD', eligibleCategories: ['backs'],            rating: 89, speed: 38, endurance: 14, defence: 66, workrate: 68, photoUrl: null },
  { id: 'p_035', name: 'Matai Halaholo',    club: 'Ipswich Pioneers',       team: 'QLD', eligibleCategories: ['backs'],            rating: 85, speed: 63, endurance: 34, defence: 82, workrate:  7, photoUrl: null },
  { id: 'p_036', name: 'Dashiell Okonkwo',  club: 'Gold Coast Rays',        team: 'QLD', eligibleCategories: ['backs'],            rating: 82, speed: 33, endurance: 44, defence: 96, workrate: 68, photoUrl: null },

  // Five-Eighth
  { id: 'p_037', name: 'Beau Fonoti',       club: 'Redcliffe Ember',        team: 'QLD', eligibleCategories: ['halves'],           rating: 92, speed: 55, endurance: 38, defence: 57, workrate: 29, photoUrl: null },
  { id: 'p_038', name: 'Hamilton Jarvis',   club: 'Townsville Stormcaps',   team: 'QLD', eligibleCategories: ['halves'],           rating: 84, speed: 51, endurance: 10, defence: 93, workrate: 54, photoUrl: null },

  // Halfback
  { id: 'p_039', name: 'Rafferty Lindgren', club: 'Brisbane Thunderhawks',  team: 'QLD', eligibleCategories: ['halves'],           rating: 93, speed: 63, endurance: 28, defence: 45, workrate: 77, photoUrl: null },
  { id: 'p_040', name: 'Otis Nakamura',     club: 'Gold Coast Rays',        team: 'QLD', eligibleCategories: ['halves'],           rating: 82, speed: 69, endurance: 17, defence:  6, workrate: 50, photoUrl: null },

  // Props
  { id: 'p_041', name: 'Viliami Kauhaka',   club: 'North Qld Tidemen',      team: 'QLD', eligibleCategories: ['forwards'],         rating: 90, speed:  6, endurance: 50, defence:  2, workrate: 43, photoUrl: null },
  { id: 'p_042', name: 'Tobias Rendall',    club: 'Brisbane Thunderhawks',  team: 'QLD', eligibleCategories: ['forwards'],         rating: 87, speed: 86, endurance: 41, defence: 17, workrate: 55, photoUrl: null },
  { id: 'p_043', name: 'Jedda Winterbourne', club: 'Ipswich Pioneers',      team: 'QLD', eligibleCategories: ['forwards'],         rating: 81, speed: 75, endurance: 30, defence: 26, workrate:  0, photoUrl: null },
  { id: 'p_044', name: 'Ollie Kahananui',   club: 'Sunshine Coast Aces',    team: 'QLD', eligibleCategories: ['forwards'],         rating: 76, speed: 89, endurance: 76, defence: 77, workrate: 77, photoUrl: null },

  // Hooker
  { id: 'p_045', name: 'Archie Pendergast', club: 'Redcliffe Ember',        team: 'QLD', eligibleCategories: ['forwards'],         rating: 91, speed: 90, endurance: 73, defence: 89, workrate: 71, photoUrl: null },
  { id: 'p_046', name: "Niko Fa'asoa",      club: 'Townsville Stormcaps',   team: 'QLD', eligibleCategories: ['forwards'],         rating: 77, speed: 82, endurance: 59, defence: 30, workrate: 63, photoUrl: null },

  // Second Row
  { id: 'p_047', name: 'Cruz Ivanisevic',   club: 'Brisbane Thunderhawks',  team: 'QLD', eligibleCategories: ['forwards'],         rating: 88, speed: 33, endurance: 26, defence: 78, workrate: 50, photoUrl: null },
  { id: 'p_048', name: 'Blake Ormsby',      club: 'Gold Coast Rays',        team: 'QLD', eligibleCategories: ['forwards'],         rating: 86, speed: 84, endurance: 51, defence: 11, workrate:  4, photoUrl: null },
  { id: 'p_049', name: 'Ronan Takiwa',      club: 'North Qld Tidemen',      team: 'QLD', eligibleCategories: ['forwards'],         rating: 80, speed:  0, endurance: 11, defence: 53, workrate: 68, photoUrl: null },

  // Lock
  { id: 'p_050', name: 'Louka Petrov',      club: 'Ipswich Pioneers',       team: 'QLD', eligibleCategories: ['forwards'],         rating: 88, speed: 31, endurance: 48, defence: 67, workrate: 37, photoUrl: null },
  { id: 'p_051', name: 'Flynn Moananu',     club: 'Redcliffe Ember',        team: 'QLD', eligibleCategories: ['forwards'],         rating: 83, speed:  2, endurance: 19, defence: 72, workrate: 68, photoUrl: null },

  // Fringe / depth
  { id: 'p_052', name: 'Jasper Okafor',     club: 'Sunshine Coast Aces',    team: 'QLD', eligibleCategories: ['backs', 'halves'],  rating: 72, speed: 49, endurance: 76, defence: 72, workrate:  7, photoUrl: null },
  { id: 'p_053', name: 'Huon Greaves',      club: 'Townsville Stormcaps',   team: 'QLD', eligibleCategories: ['backs'],            rating: 70, speed: 15, endurance: 66, defence: 90, workrate: 80, photoUrl: null },
  { id: 'p_054', name: 'Thierry Labuschagne', club: 'Gold Coast Rays',      team: 'QLD', eligibleCategories: ['backs'],            rating: 71, speed: 24, endurance: 54, defence: 61, workrate: 90, photoUrl: null },
  { id: 'p_055', name: 'Barnaby Tualau',    club: 'Ipswich Pioneers',       team: 'QLD', eligibleCategories: ['forwards'],         rating: 73, speed: 84, endurance: 47, defence: 40, workrate: 66, photoUrl: null },
  { id: 'p_056', name: 'Xavier Ngawati',    club: 'Brisbane Thunderhawks',  team: 'QLD', eligibleCategories: ['forwards'],         rating: 69, speed: 54, endurance: 74, defence: 78, workrate: 40, photoUrl: null },
]
