-- Origin Builder — fake player seed
-- 88 players: 44 NSW + 44 QLD
-- Per team: 14 backs · 7 halves · 19 forwards · 2 utility · 2 dual backs+halves
-- Re-runnable: truncate first, then insert.

truncate players;

insert into players (name, club, team, eligible_categories, rating, speed, endurance, defence, workrate) values
  -- =======================================================================
  -- NSW Blues (44)
  -- =======================================================================

  -- Backs (14)
  ('Jarrah Whitlock',    'Sydney Harbourhawks',     'NSW', ARRAY['backs'],            92, 78, 72, 65, 68),
  ('Coby Mailata',       'Parramatta Rangers',      'NSW', ARRAY['backs'],            87, 84, 70, 60, 65),
  ('Rhys Okafor',        'Cronulla Mariners',       'NSW', ARRAY['backs'],            89, 88, 68, 55, 70),
  ('Taj Blackwell',      'Penrith Ironhawks',       'NSW', ARRAY['backs'],            85, 82, 76, 62, 71),
  ('Milo Karamu',        'Newcastle Surge',         'NSW', ARRAY['backs'],            83, 79, 74, 70, 78),
  ('Declan Moretti',     'Sydney Harbourhawks',     'NSW', ARRAY['backs'],            90, 73, 71, 80, 75),
  ('Ebb Talanoa',        'Manly Marlins',           'NSW', ARRAY['backs'],            86, 81, 65, 68, 72),
  ('Hudson Varga',       'St George Dragoons',      'NSW', ARRAY['backs'],            81, 76, 73, 84, 67),
  ('Lennox Whitcombe',   'Manly Marlins',           'NSW', ARRAY['backs'],            88, 80, 70, 66, 73),
  ('Otis Brennan',       'Wests Titans',            'NSW', ARRAY['backs'],            76, 74, 71, 88, 65),
  ('Atticus Pareora',    'Cronulla Mariners',       'NSW', ARRAY['backs'],            84, 77, 69, 81, 70),
  ('Vasco Tagaloa',      'St George Dragoons',      'NSW', ARRAY['backs'],            80, 75, 72, 73, 79),
  ('Cassius Mahoney',    'Penrith Ironhawks',       'NSW', ARRAY['backs'],            78, 78, 80, 64, 66),
  ('Indigo Faiumu',      'Newcastle Surge',         'NSW', ARRAY['backs'],            82, 85, 67, 79, 60),

  -- Halves (7)
  ('Orson Blakely',      'Penrith Ironhawks',       'NSW', ARRAY['halves'],           93, 76, 80, 70, 82),
  ('Finley Durst',       'Canterbury Bulldogs XI',  'NSW', ARRAY['halves'],           86, 72, 78, 78, 75),
  ('Bodhi McRae',        'Parramatta Rangers',      'NSW', ARRAY['halves'],           88, 70, 81, 73, 77),
  ('Kai Dimitriou',      'South Sydney Saints',     'NSW', ARRAY['halves'],           91, 74, 76, 79, 80),
  ('Jonty Ellsworth',    'Wests Titans',            'NSW', ARRAY['halves'],           83, 79, 73, 65, 68),
  ('Jett Solomona',      'South Sydney Saints',     'NSW', ARRAY['halves'],           77, 81, 70, 72, 71),
  ('Beck Holloway',      'Cronulla Mariners',       'NSW', ARRAY['halves'],           80, 73, 75, 76, 84),

  -- Forwards (19)
  ('Bomber Huakau',      'Newcastle Surge',         'NSW', ARRAY['forwards'],         88, 60, 78, 82, 80),
  ('Remi Czajkowski',    'Penrith Ironhawks',       'NSW', ARRAY['forwards'],         86, 65, 81, 79, 76),
  ('Tane Fotualii',      'Parramatta Rangers',      'NSW', ARRAY['forwards'],         84, 58, 80, 78, 82),
  ('Axl Brennan',        'Sydney Harbourhawks',     'NSW', ARRAY['forwards'],         79, 55, 75, 84, 73),
  ('Knox Petrov',        'Manly Marlins',           'NSW', ARRAY['forwards'],         82, 62, 79, 81, 78),
  ('Ziggy Watene',       'St George Dragoons',      'NSW', ARRAY['forwards'],         85, 64, 82, 77, 80),
  ('Reuben Saxon',       'Wests Titans',            'NSW', ARRAY['forwards'],         77, 60, 76, 80, 74),
  ('Sully Tamatoa',      'Newcastle Surge',         'NSW', ARRAY['forwards'],         81, 57, 78, 83, 79),
  ('Quinn Maladu',       'Canterbury Bulldogs XI',  'NSW', ARRAY['forwards'],         87, 66, 80, 79, 81),
  ('Linc Vaitupu',       'South Sydney Saints',     'NSW', ARRAY['forwards'],         83, 61, 77, 82, 76),
  ('Whetu Olsen',        'Cronulla Mariners',       'NSW', ARRAY['forwards'],         78, 63, 74, 78, 75),
  ('Eden Marlow',        'Penrith Ironhawks',       'NSW', ARRAY['forwards'],         80, 67, 76, 76, 79),
  ('Carter Daldry',      'Manly Marlins',           'NSW', ARRAY['forwards'],         86, 65, 81, 80, 83),
  ('Ash Sopoaga',        'Sydney Harbourhawks',     'NSW', ARRAY['forwards'],         84, 60, 79, 81, 77),
  ('Joaquin Tukino',     'Wests Titans',            'NSW', ARRAY['forwards'],         82, 64, 78, 79, 80),
  ('Patch Connors',      'Parramatta Rangers',      'NSW', ARRAY['forwards'],         76, 56, 75, 84, 72),
  ('Talon Beresford',    'Canterbury Bulldogs XI',  'NSW', ARRAY['forwards'],         85, 62, 80, 80, 78),
  ('Quill Henare',       'Sydney Harbourhawks',     'NSW', ARRAY['forwards'],         79, 58, 76, 78, 74),
  ('Dash Kapeli',        'St George Dragoons',      'NSW', ARRAY['forwards'],         81, 61, 77, 81, 76),

  -- Utility (2) — eligible for any field position
  ('Vinnie Spence',      'Canterbury Bulldogs XI',  'NSW', ARRAY['utility'],          85, 75, 77, 76, 80),
  ('Marlon Eketone',     'South Sydney Saints',     'NSW', ARRAY['utility'],          82, 73, 75, 78, 79),

  -- Dual backs + halves (2)
  ('Eli Karaitiana',     'Newcastle Surge',         'NSW', ARRAY['backs','halves'],   84, 78, 74, 70, 76),
  ('Sage Brogan',        'Manly Marlins',           'NSW', ARRAY['backs','halves'],   80, 76, 72, 73, 75),

  -- =======================================================================
  -- QLD Maroons (44)
  -- =======================================================================

  -- Backs (14)
  ('Tully Bowden',       'Brisbane Riverhounds',    'QLD', ARRAY['backs'],            91, 79, 71, 67, 70),
  ('Ngata Pereira',      'Gold Coast Stingers',     'QLD', ARRAY['backs'],            87, 85, 69, 60, 65),
  ('Reef Quinnell',      'North QLD Cyclones',      'QLD', ARRAY['backs'],            89, 87, 67, 56, 70),
  ('Brontë Maipi',       'Sunshine Mavericks',      'QLD', ARRAY['backs'],            85, 83, 75, 63, 72),
  ('Hemi Castle',        'Townsville Thunder',      'QLD', ARRAY['backs'],            83, 80, 73, 70, 78),
  ('Wilder McAllum',     'Brisbane Riverhounds',    'QLD', ARRAY['backs'],            90, 74, 70, 80, 76),
  ('Kit Faleolo',        'Cairns Crocs',            'QLD', ARRAY['backs'],            86, 82, 66, 68, 73),
  ('Onyx Doolan',        'Toowoomba Drovers',       'QLD', ARRAY['backs'],            81, 77, 73, 84, 67),
  ('Levi Tuipulotu',     'Ipswich Steel',           'QLD', ARRAY['backs'],            88, 80, 70, 66, 73),
  ('Phoenix Watson',     'Logan Lancers',           'QLD', ARRAY['backs'],            76, 74, 71, 88, 65),
  ('Kobi Apaapa',        'Mackay Marauders',        'QLD', ARRAY['backs'],            84, 78, 69, 81, 70),
  ('Frankie Holdsworth', 'Gold Coast Stingers',     'QLD', ARRAY['backs'],            80, 75, 72, 73, 79),
  ('Wren Bartholomew',   'North QLD Cyclones',      'QLD', ARRAY['backs'],            78, 78, 80, 64, 66),
  ('Tama Selepe',        'Brisbane Riverhounds',    'QLD', ARRAY['backs'],            82, 84, 67, 79, 61),

  -- Halves (7)
  ('Brock Hailstone',    'Brisbane Riverhounds',    'QLD', ARRAY['halves'],           94, 75, 81, 70, 83),
  ('Jude Maraurau',      'Sunshine Mavericks',      'QLD', ARRAY['halves'],           86, 72, 78, 78, 75),
  ('Toby Pohatu',        'Gold Coast Stingers',     'QLD', ARRAY['halves'],           88, 70, 81, 73, 77),
  ('Memphis Aleo',       'Townsville Thunder',      'QLD', ARRAY['halves'],           90, 74, 76, 79, 81),
  ('Cassidy Tāwhiri',    'Ipswich Steel',           'QLD', ARRAY['halves'],           83, 79, 73, 65, 68),
  ('Brae Letaufa',       'Logan Lancers',           'QLD', ARRAY['halves'],           77, 81, 70, 72, 71),
  ('Holt Faleafa',       'Cairns Crocs',            'QLD', ARRAY['halves'],           80, 73, 75, 76, 84),

  -- Forwards (19)
  ('Ronan Kahawai',      'Brisbane Riverhounds',    'QLD', ARRAY['forwards'],         89, 60, 79, 83, 81),
  ('Storm Lavaka',       'North QLD Cyclones',      'QLD', ARRAY['forwards'],         86, 65, 81, 79, 76),
  ('Bear Whittaker',     'Gold Coast Stingers',     'QLD', ARRAY['forwards'],         84, 58, 80, 78, 82),
  ('Falcon Maile',       'Sunshine Mavericks',      'QLD', ARRAY['forwards'],         79, 55, 75, 84, 73),
  ('Magnus Tuala',       'Townsville Thunder',      'QLD', ARRAY['forwards'],         82, 62, 79, 81, 78),
  ('Cael Vakauta',       'Ipswich Steel',           'QLD', ARRAY['forwards'],         85, 64, 82, 77, 80),
  ('Kingsley Aloiai',    'Logan Lancers',           'QLD', ARRAY['forwards'],         77, 60, 76, 80, 74),
  ('Boaz Sefuiva',       'Mackay Marauders',        'QLD', ARRAY['forwards'],         81, 57, 78, 83, 79),
  ('Hunter Ofahengaue',  'Toowoomba Drovers',       'QLD', ARRAY['forwards'],         87, 66, 80, 79, 81),
  ('Cyrus Vailea',       'Cairns Crocs',            'QLD', ARRAY['forwards'],         83, 61, 77, 82, 76),
  ('Dre Manukau',        'Brisbane Riverhounds',    'QLD', ARRAY['forwards'],         78, 63, 74, 78, 75),
  ('Otto Herewini',      'Sunshine Mavericks',      'QLD', ARRAY['forwards'],         80, 67, 76, 76, 79),
  ('Buck Tutaki',        'North QLD Cyclones',      'QLD', ARRAY['forwards'],         86, 65, 81, 80, 83),
  ('Shay Toluono',       'Townsville Thunder',      'QLD', ARRAY['forwards'],         84, 60, 79, 81, 77),
  ('Roman Pulemau',      'Gold Coast Stingers',     'QLD', ARRAY['forwards'],         82, 64, 78, 79, 80),
  ('Mack Stoltenberg',   'Toowoomba Drovers',       'QLD', ARRAY['forwards'],         76, 56, 75, 84, 72),
  ('Vance Rakai',        'Ipswich Steel',           'QLD', ARRAY['forwards'],         85, 62, 80, 80, 78),
  ('Tig Mareko',         'Logan Lancers',           'QLD', ARRAY['forwards'],         79, 58, 76, 78, 74),
  ('Caspar Kirikiri',    'Mackay Marauders',        'QLD', ARRAY['forwards'],         81, 61, 77, 81, 76),

  -- Utility (2)
  ('Kit Tialavea',       'Brisbane Riverhounds',    'QLD', ARRAY['utility'],          85, 75, 77, 76, 80),
  ('Niko Tuiasau',       'Townsville Thunder',      'QLD', ARRAY['utility'],          83, 73, 75, 78, 79),

  -- Dual backs + halves (2)
  ('Kobe Te Kanawa',     'Cairns Crocs',            'QLD', ARRAY['backs','halves'],   84, 78, 74, 70, 76),
  ('Pasha Tukuafu',      'Gold Coast Stingers',     'QLD', ARRAY['backs','halves'],   80, 76, 72, 73, 75);

-- =========================================================================
-- Sanity checks (run separately if you want to verify)
-- =========================================================================
-- select team, count(*) from players group by team;
--   -- expect: NSW = 44, QLD = 44
-- select unnest(eligible_categories) as cat, count(*) as n
--   from players group by cat order by n desc;
--   -- expect: forwards 38, backs 32, halves 18, utility 4
