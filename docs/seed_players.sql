-- =====================================================================
-- Origin Builder — Players seed data (v0.1)
-- =====================================================================
--
-- 28 fictional players per team (56 total).
-- Coverage goals:
--   • At least 2 eligible players per starting position (1..13) per team
--   • Mix of strict specialists (1 eligible position) and utility players
--     (3+ eligible positions) to exercise eligibility logic
--   • Rating spread ~68..94
--   • Variety of clubs
--
-- Position reference:
--   1 Fullback | 2 Wing | 3 Centre | 4 Centre | 5 Wing
--   6 Five-Eighth | 7 Halfback | 8 Prop | 9 Hooker | 10 Prop
--   11 Second Row | 12 Second Row | 13 Lock
--
-- Notes:
--   • Assumes `players` table exists with columns:
--     id, name, club, team, eligible_positions, rating, photo_url, updated_at
--   • photo_url is left NULL; v1 renders a silhouette regardless.
--   • Ratings and eligibilities are illustrative, not authoritative.
--     An employee will tune these in Supabase before go-live.
--
-- Idempotency:
--   Run once on a fresh `players` table. To re-seed, TRUNCATE first:
--     TRUNCATE TABLE players RESTART IDENTITY CASCADE;
-- =====================================================================


-- ---------------------------------------------------------------------
-- NSW Blues (28 players)
-- ---------------------------------------------------------------------
INSERT INTO players (name, club, team, eligible_positions, rating) VALUES

-- Fullbacks (position 1)
('Jarrah Whitlock',   'Sydney Harbourhawks',   'NSW', ARRAY[1],          92),
('Coby Mailata',      'Parramatta Rangers',    'NSW', ARRAY[1, 2, 5],    84),  -- utility back

-- Wingers (positions 2, 5)
('Rhys Okafor',       'Cronulla Mariners',     'NSW', ARRAY[2, 5],       89),
('Taj Blackwell',     'Penrith Ironhawks',     'NSW', ARRAY[2, 5],       87),
('Milo Karamu',       'Newcastle Surge',       'NSW', ARRAY[2, 5, 1],    82),  -- wing/fullback cover

-- Centres (positions 3, 4)
('Declan Moretti',    'Sydney Harbourhawks',   'NSW', ARRAY[3, 4],       90),
('Ebb Talanoa',       'Manly Marlins',         'NSW', ARRAY[3, 4, 5],    86),  -- centre/wing
('Hudson Varga',      'St George Dragoons',    'NSW', ARRAY[3, 4],       81),

-- Five-Eighth (position 6) — specialists
('Orson Blakely',     'Penrith Ironhawks',     'NSW', ARRAY[6],          93),  -- strict 6 only
('Finley Durst',      'Canterbury Bulldogs XI','NSW', ARRAY[6, 7],       85),  -- halves utility

-- Halfback (position 7) — specialists
('Kai Dimitriou',     'South Sydney Saints',   'NSW', ARRAY[7],          91),  -- strict 7 only
('Jonty Ellsworth',   'Wests Titans',          'NSW', ARRAY[7, 6],       83),  -- halves utility

-- Props (positions 8, 10)
('Bomber Huakau',     'Newcastle Surge',       'NSW', ARRAY[8, 10],      88),
('Remi Czajkowski',   'Penrith Ironhawks',     'NSW', ARRAY[8, 10],      86),
('Tane Fotuali''i',   'Parramatta Rangers',    'NSW', ARRAY[8, 10, 13],  80),  -- prop/lock
('Axl Brennan',       'Sydney Harbourhawks',   'NSW', ARRAY[8, 10],      75),

-- Hooker (position 9) — specialists
('Wiremu Harlow',     'Manly Marlins',         'NSW', ARRAY[9],          90),  -- strict 9 only
('Teddy Ngatai',      'Cronulla Mariners',     'NSW', ARRAY[9, 13],      78),  -- hooker/lock cover

-- Second Row (positions 11, 12)
('Brock Ivanović',    'St George Dragoons',    'NSW', ARRAY[11, 12],     89),
('Jaxon Peretola',    'Canterbury Bulldogs XI','NSW', ARRAY[11, 12, 13], 85),  -- back-row utility
('Huxley Rath',       'South Sydney Saints',   'NSW', ARRAY[11, 12],     79),

-- Lock (position 13)
('Arlo Penitoa',      'Wests Titans',          'NSW', ARRAY[13],          87),  -- strict 13 only
('Nikau Delacroix',   'Penrith Ironhawks',     'NSW', ARRAY[13, 11, 12],  82),  -- back-row utility

-- Fringe / depth (lower-rated, extra options for the bench and panel)
('Sam Oriti',         'Newcastle Surge',       'NSW', ARRAY[1, 6],        73),  -- rare FB/5-8 hybrid
('Callum Rasputin',   'Manly Marlins',         'NSW', ARRAY[2, 5],        71),
('Perry Sundqvist',   'Parramatta Rangers',    'NSW', ARRAY[3, 4],        70),
('Mack Ovaltine',     'Cronulla Mariners',     'NSW', ARRAY[8, 10],       72),
('Zed Marchetti',     'Sydney Harbourhawks',   'NSW', ARRAY[11, 12, 13],  68);


-- ---------------------------------------------------------------------
-- QLD Maroons (28 players)
-- ---------------------------------------------------------------------
INSERT INTO players (name, club, team, eligible_positions, rating) VALUES

-- Fullbacks (position 1)
('Kobe Vakameilalo',   'Brisbane Thunderhawks','QLD', ARRAY[1],          94),  -- the star
('Denver Mahuta',      'Gold Coast Rays',      'QLD', ARRAY[1, 6],       83),  -- rare FB/5-8

-- Wingers (positions 2, 5)
('Tupou Sisifa',       'North Qld Tidemen',    'QLD', ARRAY[2, 5],       91),
('Boston Kealoha',     'Redcliffe Ember',      'QLD', ARRAY[2, 5],       86),
('Quincy Mfume',       'Sunshine Coast Aces',  'QLD', ARRAY[2, 5, 1],    81),

-- Centres (positions 3, 4)
('Elias Konstantinou', 'Brisbane Thunderhawks','QLD', ARRAY[3, 4],       89),
('Matai Halaholo',     'Ipswich Pioneers',     'QLD', ARRAY[3, 4, 2],    85),
('Dashiell Okonkwo',   'Gold Coast Rays',      'QLD', ARRAY[3, 4],       82),

-- Five-Eighth (position 6) — specialists
('Beau Fonoti',        'Redcliffe Ember',      'QLD', ARRAY[6],          92),  -- strict 6 only
('Hamilton Jarvis',    'Townsville Stormcaps', 'QLD', ARRAY[6, 7],       84),  -- halves utility

-- Halfback (position 7) — specialists
('Rafferty Lindgren',  'Brisbane Thunderhawks','QLD', ARRAY[7],          93),  -- strict 7 only
('Otis Nakamura',      'Gold Coast Rays',      'QLD', ARRAY[7, 6],       82),

-- Props (positions 8, 10)
('Viliami Kauhaka',    'North Qld Tidemen',    'QLD', ARRAY[8, 10],      90),
('Tobias Rendall',     'Brisbane Thunderhawks','QLD', ARRAY[8, 10],      87),
('Jedda Winterbourne', 'Ipswich Pioneers',     'QLD', ARRAY[8, 10, 13],  81),  -- prop/lock
('Ollie Kahananui',    'Sunshine Coast Aces',  'QLD', ARRAY[8, 10],      76),

-- Hooker (position 9) — specialists
('Archie Pendergast',  'Redcliffe Ember',      'QLD', ARRAY[9],          91),  -- strict 9 only
('Niko Fa''asoa',      'Townsville Stormcaps', 'QLD', ARRAY[9, 13],      77),

-- Second Row (positions 11, 12)
('Cruz Ivanisevic',    'Brisbane Thunderhawks','QLD', ARRAY[11, 12],     88),
('Blake Ormsby',       'Gold Coast Rays',      'QLD', ARRAY[11, 12, 13], 86),  -- back-row utility
('Ronan Takiwa',       'North Qld Tidemen',    'QLD', ARRAY[11, 12],     80),

-- Lock (position 13)
('Louka Petrov',       'Ipswich Pioneers',     'QLD', ARRAY[13],         88),  -- strict 13 only
('Flynn Moananu',      'Redcliffe Ember',      'QLD', ARRAY[13, 11, 12], 83),

-- Fringe / depth
('Jasper Okafor',      'Sunshine Coast Aces',  'QLD', ARRAY[1, 6],       72),
('Huon Greaves',       'Townsville Stormcaps', 'QLD', ARRAY[2, 5],       70),
('Thierry Labuschagne', 'Gold Coast Rays',     'QLD', ARRAY[3, 4],       71),
('Barnaby Tualau',     'Ipswich Pioneers',     'QLD', ARRAY[8, 10],      73),
('Xavier Ngawati',     'Brisbane Thunderhawks','QLD', ARRAY[11, 12, 13], 69);


-- =====================================================================
-- Quick sanity queries (run after insert, optional)
-- =====================================================================

-- Total counts per team (expect 28 each)
-- SELECT team, COUNT(*) FROM players GROUP BY team ORDER BY team;

-- Coverage per starting position per team (expect >= 2 for each pos 1..13)
-- SELECT team, pos, COUNT(*) AS eligible_count
-- FROM players, UNNEST(eligible_positions) AS pos
-- GROUP BY team, pos
-- ORDER BY team, pos;

-- Confirm strict specialists exist per team (pos 6, 7, 9, 13 should each have >= 1)
-- SELECT team, eligible_positions, COUNT(*)
-- FROM players
-- WHERE array_length(eligible_positions, 1) = 1
-- GROUP BY team, eligible_positions
-- ORDER BY team, eligible_positions;
