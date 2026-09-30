// ─── Personalize here ───────────────────────────────────────────────
export const CONFIG = {
  honoree: 'Chris',
  from: 'Brandon',
  year: 2026,
  category: 'Best Birthday in a Leading Role',
  prize: '$1.41',
};

// ─── Round 1: Classic trivia ────────────────────────────────────────
export const CLASSIC = [
  {
    q: 'The very first Academy Awards ceremony (1929) lasted roughly how long?',
    a: '15 minutes',
    wrong: ['2 hours', '4 hours', 'Two full days'],
    fact: 'Winners had been announced three months earlier, so suspense was low. Tickets were $5.',
  },
  {
    q: 'Which film won the very first top prize (then called "Outstanding Picture")?',
    a: 'Wings',
    wrong: ['Sunrise', 'The Jazz Singer', 'Metropolis'],
    fact: 'The WWI aviation epic "Wings" took the top prize at the first ceremony in 1929.',
  },
  {
    q: 'Three films share the record of 11 Oscar wins. Which of these is NOT one of them?',
    a: 'West Side Story',
    wrong: ['Ben-Hur', 'Titanic', 'The Lord of the Rings: The Return of the King'],
    fact: 'West Side Story won "only" 10. Ben-Hur, Titanic, and Return of the King each won 11.',
  },
  {
    q: 'Who holds the record for most acting Oscars, with four wins?',
    a: 'Katharine Hepburn',
    wrong: ['Meryl Streep', 'Jack Nicholson', 'Daniel Day-Lewis'],
    fact: 'Hepburn won for Morning Glory, Guess Who\'s Coming to Dinner, The Lion in Winter, and On Golden Pond.',
  },
  {
    q: 'Who is the only person to win Best Actor three times?',
    a: 'Daniel Day-Lewis',
    wrong: ['Jack Nicholson', 'Tom Hanks', 'Marlon Brando'],
    fact: 'My Left Foot, There Will Be Blood, and Lincoln. Presumably he stayed in character for all three speeches.',
  },
  {
    q: 'In the infamous 2017 envelope mix-up, which film was WRONGLY announced as Best Picture?',
    a: 'La La Land',
    wrong: ['Moonlight', 'Hidden Figures', 'Manchester by the Sea'],
    fact: 'Warren Beatty and Faye Dunaway had been handed the Best Actress envelope (Emma Stone, La La Land). Moonlight was the real winner.',
  },
  {
    q: 'What was the first non-English-language film to win Best Picture?',
    a: 'Parasite',
    wrong: ['Roma', 'Crouching Tiger, Hidden Dragon', 'Life Is Beautiful'],
    fact: 'Bong Joon Ho\'s Parasite won four Oscars in 2020, including Best Picture and Best Director.',
  },
  {
    q: 'Who was the first woman to win Best Director?',
    a: 'Kathryn Bigelow',
    wrong: ['Sofia Coppola', 'Greta Gerwig', 'Jane Campion'],
    fact: 'Bigelow won in 2010 for The Hurt Locker, which also took Best Picture.',
  },
  {
    q: 'The Oscar statuette stands on a film reel with five spokes. What do the spokes represent?',
    a: 'The Academy\'s five original branches',
    wrong: ['The five senses', 'Five founding studios', 'The first five winners'],
    fact: 'Actors, directors, producers, technicians, and writers.',
  },
  {
    q: 'During World War II, Oscar statuettes were temporarily made of…',
    a: 'Painted plaster',
    wrong: ['Solid chocolate', 'Carved wood', 'Tin foil'],
    fact: 'Because of wartime metal shortages. Winners could trade them in for the real thing after the war.',
  },
  {
    q: 'Who hosted the Oscars a record 19 times?',
    a: 'Bob Hope',
    wrong: ['Billy Crystal', 'Johnny Carson', 'Jimmy Kimmel'],
    fact: 'Hope never won a competitive Oscar himself and joked: "Welcome to the Academy Awards. Or, as it\'s known at my house, Passover."',
  },
  {
    q: 'Which is the only horror film to win Best Picture?',
    a: 'The Silence of the Lambs',
    wrong: ['The Exorcist', 'Get Out', 'Jaws'],
    fact: 'It also won all of the "Big Five": Picture, Director, Actor, Actress, and Screenplay.',
  },
  {
    q: 'Which Best Picture winner was originally rated X?',
    a: 'Midnight Cowboy',
    wrong: ['A Clockwork Orange', 'The Godfather', 'Taxi Driver'],
    fact: 'Midnight Cowboy (1969) is the only X-rated Best Picture winner. A Clockwork Orange was nominated but lost.',
  },
  {
    q: 'Sally Field\'s 1985 speech is famously misquoted as "You really like me!" What did she actually say?',
    a: '"I can\'t deny the fact that you like me, right now, you like me!"',
    wrong: ['"You really, really like me!"', '"You like me! You finally, truly like me!"', '"I guess you people actually like me!"'],
    fact: 'She won Best Actress for Places in the Heart, and the misquote has followed her ever since.',
  },
  {
    q: 'Which film finally won Leonardo DiCaprio his Oscar?',
    a: 'The Revenant',
    wrong: ['The Wolf of Wall Street', 'The Aviator', 'Once Upon a Time in Hollywood'],
    fact: 'He won in 2016, ending one of the internet\'s longest-running memes.',
  },
  {
    q: 'Walt Disney got an honorary Oscar for Snow White, plus how many miniature statuettes?',
    a: 'Seven',
    wrong: ['Three', 'Twelve', 'None. Snow White ate them.'],
    fact: 'Presented by 10-year-old Shirley Temple in 1939. Disney holds the record for most Oscars won by one person.',
  },
  {
    q: 'In 2026, which film broke the all-time record with 16 Oscar nominations?',
    a: 'Sinners',
    wrong: ['One Battle After Another', 'Hamnet', 'Marty Supreme'],
    fact: 'The previous record of 14 was shared by All About Eve, Titanic, and La La Land.',
  },
  {
    q: 'Which film won Best Picture at the 98th Academy Awards in March 2026?',
    a: 'One Battle After Another',
    wrong: ['Sinners', 'Hamnet', 'Frankenstein'],
    fact: 'Paul Thomas Anderson also took Best Director for it.',
  },
  {
    q: 'Who is the youngest person to win a competitive acting Oscar?',
    a: 'Tatum O\'Neal',
    wrong: ['Shirley Temple', 'Anna Paquin', 'Jodie Foster'],
    fact: 'She was 10 when she won Best Supporting Actress for Paper Moon (1974). Shirley Temple\'s was an honorary juvenile award.',
  },
  {
    q: 'Who is the oldest person ever to win Best Actor?',
    a: 'Anthony Hopkins',
    wrong: ['Henry Fonda', 'Christopher Plummer', 'Clint Eastwood'],
    fact: 'He was 83 when he won for The Father (2021), and he was asleep in Wales when his name was announced.',
  },
  {
    q: 'In 2014, host Ellen DeGeneres broke Twitter with…',
    a: 'A star-studded group selfie',
    wrong: ['A live-tweeted proposal', 'A tweet from Meryl Streep\'s account', 'Tweeting the winners early'],
    fact: 'It became the most-retweeted post ever at the time. She also ordered pizza for the front row.',
  },
  {
    q: 'Who won back-to-back Best Actor Oscars for Philadelphia and Forrest Gump?',
    a: 'Tom Hanks',
    wrong: ['Tom Cruise', 'Denzel Washington', 'Al Pacino'],
    fact: 'Spencer Tracy was the first actor to win back-to-back, in 1938 and 1939.',
  },
  {
    q: 'What was the first sequel to win Best Picture?',
    a: 'The Godfather Part II',
    wrong: ['The Lord of the Rings: The Return of the King', 'Aliens', 'Toy Story 3'],
    fact: 'Return of the King is the only other sequel to take the top prize.',
  },
  {
    q: 'What is the Oscar\'s OFFICIAL name?',
    a: 'The Academy Award of Merit',
    wrong: ['The Golden Knight', 'The Gibbons Trophy', 'Statuette No. 1'],
    fact: 'The Academy adopted the nickname "Oscar" in 1939. Legend says a librarian thought it looked like her Uncle Oscar.',
  },
  {
    q: 'Greer Garson gave one of the longest Oscar speeches ever (about 5½ minutes). What film was it for?',
    a: 'Mrs. Miniver',
    wrong: ['Casablanca', 'Rebecca', 'Gone with the Wind'],
    fact: 'That was 1943. Today\'s winners get about 45 seconds before the orchestra plays them off.',
  },
  {
    q: 'Who became the first Asian woman to win Best Actress?',
    a: 'Michelle Yeoh',
    wrong: ['Gong Li', 'Zhang Ziyi', 'Awkwafina'],
    fact: 'She won for Everything Everywhere All at Once, which took home 7 Oscars in 2023.',
  },
  {
    q: 'Jennifer Lawrence famously tripped on the stairs while going up to accept Best Actress for…',
    a: 'Silver Linings Playbook',
    wrong: ['American Hustle', 'Winter\'s Bone', 'Joy'],
    fact: 'She still got a standing ovation, and the recovery was arguably the best performance of the night.',
  },
];

// ─── Round 2: Best Picture winners in emoji ─────────────────────────
export const EMOJI = [
  { e: '🚢🧊💔', a: 'Titanic', year: 1997 },
  { e: '💍🌋👑', a: 'The Return of the King', year: 2003 },
  { e: '🐟💚🛁', a: 'The Shape of Water', year: 2017 },
  { e: '🍑🪨🏠', a: 'Parasite', year: 2019 },
  { e: '🥊🥚🏃', a: 'Rocky', year: 1976 },
  { e: '🏃🍫🪶', a: 'Forrest Gump', year: 1994 },
  { e: '⚔️🐅🏟️', a: 'Gladiator', year: 2000 },
  { e: '🎩⚛️💥', a: 'Oppenheimer', year: 2023 },
  { e: '🌙🌊💙', a: 'Moonlight', year: 2016 },
  { e: '🐴🛏️🍊', a: 'The Godfather', year: 1972 },
  { e: '💰❓🇮🇳', a: 'Slumdog Millionaire', year: 2008 },
  { e: '🎤👑😬', a: 'The King\'s Speech', year: 2010 },
  { e: '🐕🎞️🤐', a: 'The Artist', year: 2011 },
  { e: '✈️🎬🇮🇷', a: 'Argo', year: 2012 },
  { e: '🐦🦸‍♂️🥁', a: 'Birdman', year: 2014 },
  { e: '⛰️🎶👗', a: 'The Sound of Music', year: 1965 },
  { e: '🥯👀🌌', a: 'Everything Everywhere All at Once', year: 2022 },
  { e: '🐺💃🏇', a: 'Dances with Wolves', year: 1990 },
  { e: '🧠🧮🏆', a: 'A Beautiful Mind', year: 2001 },
];
// Famous films that never won Best Picture. Good decoys.
export const EMOJI_DECOYS = [
  'Jaws', 'Star Wars', 'Pulp Fiction', 'Avatar', 'Top Gun: Maverick', 'Barbie',
  'Inception', 'Black Swan', 'Life of Pi', 'The Martian', 'Jurassic Park', 'La La Land',
  'The Shawshank Redemption', 'Raging Bull', 'Citizen Kane', 'Mad Max: Fury Road',
];

// ─── Round 3: Guess the year (ceremony year) ────────────────────────
export const YEARS = [
  { e: 'The very first Academy Awards ceremony is held at the Hollywood Roosevelt Hotel', y: 1929 },
  { e: 'Hattie McDaniel becomes the first Black performer to win an Oscar (Gone with the Wind)', y: 1940 },
  { e: 'The Oscars are broadcast on television for the first time', y: 1953 },
  { e: 'The Oscars are broadcast in color for the first time', y: 1966 },
  { e: 'Marlon Brando declines his Godfather Oscar; Sacheen Littlefeather speaks in his place', y: 1973 },
  { e: 'A streaker runs across the stage behind David Niven', y: 1974 },
  { e: 'Titanic ties the record with 11 wins', y: 1998 },
  { e: 'Halle Berry and Denzel Washington win Best Actress and Best Actor on the same night', y: 2002 },
  { e: 'Heath Ledger wins posthumously for The Dark Knight', y: 2009 },
  { e: 'Jennifer Lawrence trips on the stairs on her way to accept Best Actress', y: 2013 },
  { e: 'Ellen\'s group selfie breaks Twitter', y: 2014 },
  { e: 'Leonardo DiCaprio finally wins (The Revenant)', y: 2016 },
  { e: 'La La Land is announced as Best Picture… except it was Moonlight', y: 2017 },
  { e: 'Parasite becomes the first non-English-language Best Picture winner', y: 2020 },
  { e: 'Everything Everywhere All at Once wins 7 Oscars', y: 2023 },
  { e: 'Oppenheimer wins Best Picture', y: 2024 },
];

// ─── Red carpet timeline ────────────────────────────────────────────
export const DECADES = [
  { d: '1920s', winners: ['Wings (1927/28)', 'The Broadway Melody (1928/29)'],
    fact: 'The first ceremony lasted about 15 minutes. Tickets cost $5, and the winners were announced months in advance.' },
  { d: '1930s', winners: ['All Quiet on the Western Front', 'It Happened One Night', 'Gone with the Wind'],
    fact: 'Snow White earned Walt Disney one full-size Oscar and seven tiny ones. "Oscar" became the official nickname in 1939.' },
  { d: '1940s', winners: ['Rebecca', 'Casablanca', 'The Best Years of Our Lives'],
    fact: 'During WWII the statuettes were made of painted plaster because metal was scarce.' },
  { d: '1950s', winners: ['All About Eve', 'On the Waterfront', 'Ben-Hur'],
    fact: 'The Oscars were first televised in 1953. Ben-Hur set the record with 11 wins.' },
  { d: '1960s', winners: ['The Apartment', 'Lawrence of Arabia', 'The Sound of Music', 'Midnight Cowboy'],
    fact: 'The first color broadcast was in 1966. Midnight Cowboy is still the only X-rated Best Picture winner.' },
  { d: '1970s', winners: ['The Godfather', 'The Godfather Part II', 'Rocky', 'Annie Hall'],
    fact: 'Brando declined his Oscar in 1973, and a streaker crashed the stage in 1974.' },
  { d: '1980s', winners: ['Chariots of Fire', 'Amadeus', 'Rain Man'],
    fact: 'In 1985, Sally Field said "you like me, right now, you like me!" It has been misquoted ever since.' },
  { d: '1990s', winners: ['Dances with Wolves', 'The Silence of the Lambs', 'Forrest Gump', 'Titanic'],
    fact: 'Titanic sailed to 11 wins and 14 nominations, and Hanks won back-to-back Best Actor Oscars.' },
  { d: '2000s', winners: ['Gladiator', 'The Return of the King', 'The Departed', 'Slumdog Millionaire'],
    fact: 'Return of the King won all 11 of its nominations, a perfect sweep.' },
  { d: '2010s', winners: ['The King\'s Speech', 'The Artist', 'Moonlight', 'Parasite'],
    fact: 'In 2017 the wrong envelope made La La Land "win" for about two minutes.' },
  { d: '2020s', winners: ['Nomadland', 'Everything Everywhere…', 'Oppenheimer', 'Anora', 'One Battle After Another'],
    fact: 'Sinners set the all-time record with 16 nominations in 2026. The next milestone is Chris\'s Oscar party.' },
];

// Shown when you tap the big statue.
export const STATUE_FACTS = [
  'The Oscar statuette stands 13.5 inches tall and weighs 8.5 pounds.',
  'The knight stands on a film reel with five spokes, one for each of the Academy\'s original branches.',
  'Oscars are solid bronze, plated in 24-karat gold.',
  'Winners must offer to sell their Oscar back to the Academy for $1 before selling it to anyone else. That makes Chris\'s $1.41 prize worth more than an Oscar.',
  'MGM art director Cedric Gibbons designed the statuette, and sculptor George Stanley brought it to life.',
  'Walt Disney holds the record for most Oscars won by one person: 22 competitive wins.',
  'Meryl Streep holds the record with 21 acting nominations. Chris holds the record for best Oscar party.',
  'Nobody has ever won an Oscar for Best Birthday. Until tonight.',
];

export const SPEECH = {
  categories: [
    'Best Birthday in a Leading Role',
    'Lifetime Achievement in Oscar Ballot Predictions',
    'Best Original Party Snack Spread',
    'Best Supporting Friend',
    'Best Visual Effects (Hiding Gray Hairs)',
    'Best Adapted Birthday Plans',
    'Outstanding Achievement in Staying Awake Through the Short Film Categories',
  ],
  openers: [
    'Wow. I didn\'t prepare anything, which is why I have this seven-page speech.',
    'First of all, I\'d like to thank the Academy of Chris\'s Friends and Associated Sciences.',
    'Is this thing on? Okay. Deep breath. I\'m not going to cry. I\'m definitely going to cry.',
    'They told me it\'s an honor just to be nominated. They lied. This is so much better.',
    'Wow. And I was up against some tough competition: literally every other birthday.',
  ],
  thanks: [
    'my mom, who handled the original production',
    'everyone who blocked today off on their calendars',
    'the person who invented cake',
    'the snack table at my Oscar party',
    'my agent, who I don\'t have',
    'Daniel Day-Lewis, who has been method-acting as my friend for years',
    'Meryl. Just… Meryl.',
    'the orchestra, who are already warming up to play me off',
    'the one dollar and forty-one cents that brought us all together',
    'Warren Beatty, for handing over the correct envelope this time',
    'the robots who wrote this speech',
    'everyone who picked against me in the office pool',
  ],
  middles: [
    'When I was a kid, I stood in front of the mirror holding a shampoo bottle and practiced this exact speech. The shampoo bottle is here tonight. Stand up, Pantene.',
    'People say the Oscars are about the movies. But really? They\'re about the ballot pool. And I am winning the ballot pool.',
    'I\'ve watched this ceremony every year of my life, and I just want to say: I have notes on the pacing.',
    'Another year older, but let me remind everyone that Anthony Hopkins won Best Actor at 83. I am just getting warmed up.',
    'This birthday was a passion project. Principal photography took 365 days, and we went way over budget on cake.',
    'Somebody told me to keep this under 45 seconds. I\'ve waited a whole year for this. Nobody is keeping this under 45 seconds.',
  ],
  closers: [
    'Go see movies in theaters! Goodnight!',
    'And to the kids watching at home: blow out your candles, dream big, and always pick the upset in Best Documentary Short.',
    'I love you all. Where\'s the after-party? Oh wait, it\'s at my place in March.',
    'Thank you, goodnight, and remember: the envelope is always right. Eventually.',
    'I\'m king of the world! …Wrong movie. Thank you!',
  ],
};

// Rank by number of Oscars earned out of 15.
export const RANKS = [
  { min: 15, title: 'The Return of the King', blurb: 'A perfect sweep! 15 for 15. Peter Jackson is jealous.' },
  { min: 12, title: 'Best Picture Material', blurb: 'The Academy is basically writing your name on the envelope already.' },
  { min: 9, title: 'Meryl-Level Nominee', blurb: 'Consistently brilliant. The Academy takes notice.' },
  { min: 6, title: 'Leo, Pre-Revenant', blurb: 'So close, so many times. Your bear fight is coming.' },
  { min: 3, title: 'Best Supporting Snacker', blurb: 'You came for the party dip, and honestly, that\'s valid.' },
  { min: 0, title: 'It\'s an Honor Just to Be Nominated', blurb: 'The orchestra is playing you off, but you still look fabulous.' },
];
