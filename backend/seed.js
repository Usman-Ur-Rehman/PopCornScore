require('dotenv').config();
const { sql, pool, poolConnect } = require('./config/db');

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BG  = 'https://image.tmdb.org/t/p/original';

const genres = [
  'Action','Adventure','Animation','Biography','Comedy',
  'Crime','Drama','Fantasy','History','Horror',
  'Mystery','Romance','Sci-Fi','Thriller'
];

const titles = [
  // MOVIES
  {
    title: 'The Shawshank Redemption', type: 'Movie', release_date: '1994-09-23',
    poster_url: TMDB_IMG + '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    cover_url:  TMDB_BG  + '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    trailer_url: null,
    summary: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank State Penitentiary, where he puts his accounting skills to work for an amoral warden.',
    genres: ['Drama']
  },
  {
    title: 'The Godfather', type: 'Movie', release_date: '1972-03-14',
    poster_url: TMDB_IMG + '/3bhkrj58Vtu7enYsLegHnDmnidn.jpg',
    cover_url:  TMDB_BG  + '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    trailer_url: null,
    summary: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When patriarch Vito Corleone narrowly escapes assassination, his youngest son Michael reluctantly joins the business.',
    genres: ['Crime','Drama']
  },
  {
    title: 'The Dark Knight', type: 'Movie', release_date: '2008-07-14',
    poster_url: TMDB_IMG + '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    cover_url:  TMDB_BG  + '/nMKdUFyrkNxBYMegDqvoz3YYYCO.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    summary: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    genres: ['Action','Crime','Thriller']
  },
  {
    title: 'Inception', type: 'Movie', release_date: '2010-07-08',
    poster_url: TMDB_IMG + '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    cover_url:  TMDB_BG  + '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    summary: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered impossible.',
    genres: ['Action','Sci-Fi','Thriller']
  },
  {
    title: 'Interstellar', type: 'Movie', release_date: '2014-11-05',
    poster_url: TMDB_IMG + '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    cover_url:  TMDB_BG  + '/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    summary: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival after Earth becomes uninhabitable.',
    genres: ['Adventure','Drama','Sci-Fi']
  },
  {
    title: 'Forrest Gump', type: 'Movie', release_date: '1994-07-06',
    poster_url: TMDB_IMG + '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    cover_url:  TMDB_BG  + '/qdIMHd4sEfJSckfVJfKQvisL02a.jpg',
    trailer_url: null,
    summary: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an extraordinary life.',
    genres: ['Comedy','Drama','Romance']
  },
  {
    title: 'Pulp Fiction', type: 'Movie', release_date: '1994-09-10',
    poster_url: TMDB_IMG + '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    cover_url:  TMDB_BG  + '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    trailer_url: null,
    summary: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    genres: ['Crime','Drama','Thriller']
  },
  {
    title: 'The Matrix', type: 'Movie', release_date: '1999-03-30',
    poster_url: TMDB_IMG + '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    cover_url:  TMDB_BG  + '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
    summary: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    genres: ['Action','Sci-Fi']
  },
  {
    title: 'Avengers: Endgame', type: 'Movie', release_date: '2019-04-26',
    poster_url: TMDB_IMG + '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    cover_url:  TMDB_BG  + '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    summary: 'After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos\'s actions and restore balance to the universe.',
    genres: ['Action','Adventure','Sci-Fi']
  },
  {
    title: 'Joker', type: 'Movie', release_date: '2019-10-02',
    poster_url: TMDB_IMG + '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    cover_url:  TMDB_BG  + '/n6bUvigpRFqSwmPp1m2YADwJoCD.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
    summary: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
    genres: ['Crime','Drama','Thriller']
  },
  {
    title: 'Oppenheimer', type: 'Movie', release_date: '2023-07-21',
    poster_url: TMDB_IMG + '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    cover_url:  TMDB_BG  + '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    summary: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genres: ['Biography','Drama','History']
  },
  {
    title: 'Parasite', type: 'Movie', release_date: '2019-05-30',
    poster_url: TMDB_IMG + '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    cover_url:  TMDB_BG  + '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
    summary: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genres: ['Comedy','Drama','Thriller']
  },
  {
    title: 'Fight Club', type: 'Movie', release_date: '1999-10-15',
    poster_url: TMDB_IMG + '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    cover_url:  TMDB_BG  + '/87hTDiay2N2qWyX4Ds7HsDDQTqJ.jpg',
    trailer_url: null,
    summary: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    genres: ['Drama','Mystery','Thriller']
  },
  {
    title: 'The Silence of the Lambs', type: 'Movie', release_date: '1991-01-30',
    poster_url: TMDB_IMG + '/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg',
    cover_url:  TMDB_BG  + '/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg',
    trailer_url: null,
    summary: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer who skins his victims.',
    genres: ['Crime','Drama','Horror','Mystery','Thriller']
  },
  {
    title: 'Schindler\'s List', type: 'Movie', release_date: '1993-11-30',
    poster_url: TMDB_IMG + '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    cover_url:  TMDB_BG  + '/loRmRzQXZeqG78TqZEgjHOKeUTh.jpg',
    trailer_url: null,
    summary: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
    genres: ['Biography','Drama','History']
  },
  {
    title: 'The Wolf of Wall Street', type: 'Movie', release_date: '2013-12-25',
    poster_url: TMDB_IMG + '/certElbkLfNsGSRNBYqvM7iPVnm.jpg',
    cover_url:  TMDB_BG  + '/3Rf0bgDjBpbfXm6GJmFDOVRzXaE.jpg',
    trailer_url: null,
    summary: 'Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.',
    genres: ['Biography','Comedy','Crime','Drama']
  },
  {
    title: 'Whiplash', type: 'Movie', release_date: '2014-10-10',
    poster_url: TMDB_IMG + '/oPX3SBobqANS1sE5QN7Qj7SBYHI.jpg',
    cover_url:  TMDB_BG  + '/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg',
    trailer_url: null,
    summary: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    genres: ['Drama','Music']
  },
  {
    title: 'La La Land', type: 'Movie', release_date: '2016-11-29',
    poster_url: TMDB_IMG + '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    cover_url:  TMDB_BG  + '/nadTlnTE8bCqQkDOEKf57MpFijK.jpg',
    trailer_url: null,
    summary: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    genres: ['Comedy','Drama','Music','Romance']
  },
  {
    title: 'Spider-Man: No Way Home', type: 'Movie', release_date: '2021-12-17',
    poster_url: TMDB_IMG + '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    cover_url:  TMDB_BG  + '/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    summary: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
    genres: ['Action','Adventure','Sci-Fi']
  },
  {
    title: 'Goodfellas', type: 'Movie', release_date: '1990-09-19',
    poster_url: TMDB_IMG + '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    cover_url:  TMDB_BG  + '/sw7mordbZxgITU877yTpZCud90M.jpg',
    trailer_url: null,
    summary: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
    genres: ['Biography','Crime','Drama']
  },
  // TV SHOWS
  {
    title: 'Breaking Bad', type: 'TV Show', release_date: '2008-01-20',
    poster_url: TMDB_IMG + '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    cover_url:  TMDB_BG  + '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    summary: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student as his cancer diagnosis leads him to produce and sell crystal meth to secure his family\'s future.',
    genres: ['Crime','Drama','Thriller']
  },
  {
    title: 'Game of Thrones', type: 'TV Show', release_date: '2011-04-17',
    poster_url: TMDB_IMG + '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    cover_url:  TMDB_BG  + '/suopoADq0k8YZr4dQXcU6t4BWJB.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
    summary: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    genres: ['Action','Adventure','Drama','Fantasy']
  },
  {
    title: 'Stranger Things', type: 'TV Show', release_date: '2016-07-15',
    poster_url: TMDB_IMG + '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    cover_url:  TMDB_BG  + '/rcA17r3hfHtRRoqBgECYhlv5qKu.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    summary: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    genres: ['Drama','Fantasy','Horror','Mystery','Sci-Fi']
  },
  {
    title: 'The Office', type: 'TV Show', release_date: '2005-03-24',
    poster_url: TMDB_IMG + '/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
    cover_url:  TMDB_BG  + '/3X3rLCvtRJTpfpqIyDzC2bQO2Yd.jpg',
    trailer_url: null,
    summary: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    genres: ['Comedy']
  },
  {
    title: 'Friends', type: 'TV Show', release_date: '1994-09-22',
    poster_url: TMDB_IMG + '/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
    cover_url:  TMDB_BG  + '/l0qVZIpXtIo7km9uzl66IqnhFwK.jpg',
    trailer_url: null,
    summary: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
    genres: ['Comedy','Romance']
  },
  {
    title: 'Chernobyl', type: 'TV Show', release_date: '2019-05-06',
    poster_url: TMDB_IMG + '/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    cover_url:  TMDB_BG  + '/x0S6RkNNnD5MBQy9UEJzpfHDj5H.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=s9APLXM9Ei8',
    summary: 'In April 1986, an explosion at the Chernobyl nuclear power plant in the USSR becomes one of the world\'s worst man-made catastrophes.',
    genres: ['Drama','History','Mystery','Thriller']
  },
  {
    title: 'Sherlock', type: 'TV Show', release_date: '2010-07-25',
    poster_url: TMDB_IMG + '/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
    cover_url:  TMDB_BG  + '/oTsUJMCcFwkHQmxNaHO85tVZFUd.jpg',
    trailer_url: null,
    summary: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.',
    genres: ['Crime','Drama','Mystery','Thriller']
  },
  {
    title: 'Black Mirror', type: 'TV Show', release_date: '2011-12-04',
    poster_url: TMDB_IMG + '/7PRddO7z7mcPi21nZTCMGShAyy1.jpg',
    cover_url:  TMDB_BG  + '/5UkzNSOK561c2QRy2Zr4AkADzLT.jpg',
    trailer_url: null,
    summary: 'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations and darkest instincts collide.',
    genres: ['Drama','Sci-Fi','Thriller']
  },
  {
    title: 'The Witcher', type: 'TV Show', release_date: '2019-12-20',
    poster_url: TMDB_IMG + '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    cover_url:  TMDB_BG  + '/uyJgFZxf01kJiCFMqPKzSdyGCdY.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=ndl7pnZBwsY',
    summary: 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.',
    genres: ['Action','Adventure','Drama','Fantasy']
  },
  {
    title: 'The Crown', type: 'TV Show', release_date: '2016-11-04',
    poster_url: TMDB_IMG + '/1M876KPjulVwppEpldhdc8V4o68.jpg',
    cover_url:  TMDB_BG  + '/aFAFHtOcBLNUoqBObIhnHmkRe9U.jpg',
    trailer_url: null,
    summary: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
    genres: ['Biography','Drama','History']
  },
];

const people = [
  { name: 'Morgan Freeman',      picture_url: TMDB_IMG+'/jPsLqiYGSofU4s6BjrxnefMfabb.jpg', bio: 'Academy Award-winning American actor and narrator.', birth_date: '1937-06-01' },
  { name: 'Tim Robbins',         picture_url: TMDB_IMG+'/uh2S3aBQnXMbCm9g1SumCz8LgRm.jpg', bio: 'American actor, filmmaker, and political activist.', birth_date: '1958-10-16' },
  { name: 'Marlon Brando',       picture_url: TMDB_IMG+'/fuTEPMDM5morFOtkHCMBB1vMtSZ.jpg', bio: 'Considered one of the greatest actors of all time. Known for The Godfather and A Streetcar Named Desire.', birth_date: '1924-04-03' },
  { name: 'Al Pacino',           picture_url: TMDB_IMG+'/2oMfZLWcVKKTQ4UmBOBQblGqNAW.jpg', bio: 'American actor and filmmaker known for his crime and drama roles.', birth_date: '1940-04-25' },
  { name: 'Christian Bale',      picture_url: TMDB_IMG+'/qCpZn2e3dimwbryLnqxZuI88PTi.jpg', bio: 'Welsh actor known for his intense method acting. Starred in The Dark Knight trilogy.', birth_date: '1974-01-30' },
  { name: 'Heath Ledger',        picture_url: TMDB_IMG+'/1UB5E6TsE1E5UYBGv3kWPnlpyIM.jpg', bio: 'Australian actor who posthumously won an Academy Award for his role as the Joker.', birth_date: '1979-04-04' },
  { name: 'Leonardo DiCaprio',   picture_url: TMDB_IMG+'/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg', bio: 'American actor and film producer known for taking on challenging roles.', birth_date: '1974-11-11' },
  { name: 'Tom Hanks',           picture_url: TMDB_IMG+'/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg', bio: 'One of the most popular and recognizable film stars worldwide.', birth_date: '1956-07-09' },
  { name: 'Robin Wright',        picture_url: TMDB_IMG+'/wkEBTYReFTAOLmFGnXCPqUXxEai.jpg', bio: 'American actress and director known for Forrest Gump and House of Cards.', birth_date: '1966-04-08' },
  { name: 'Keanu Reeves',        picture_url: TMDB_IMG+'/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg', bio: 'Canadian actor known for his roles in The Matrix trilogy and John Wick.', birth_date: '1964-09-02' },
  { name: 'Matthew McConaughey', picture_url: TMDB_IMG+'/eaIGfLd7WplRWGbcUeUxeSLLAnV.jpg', bio: 'American actor known for his Oscar-winning role in Dallas Buyers Club and Interstellar.', birth_date: '1969-11-04' },
  { name: 'Anne Hathaway',       picture_url: TMDB_IMG+'/tLelKoPNiyJCSEtQTz1FGv4TLGc.jpg', bio: 'American actress known for her wide range from comedy to drama.', birth_date: '1982-11-12' },
  { name: 'Joaquin Phoenix',     picture_url: TMDB_IMG+'/nXMzvVF6xR3OXOedozfOcoA20xh.jpg', bio: 'American actor known for intense and transformative performances.', birth_date: '1974-10-28' },
  { name: 'Cillian Murphy',      picture_url: TMDB_IMG+'/dm6V24NjjvjMiCtbMkc8Y2WPm2e.jpg', bio: 'Irish actor known for Peaky Blinders and his work with Christopher Nolan.', birth_date: '1976-05-25' },
  { name: 'Robert Downey Jr.',   picture_url: TMDB_IMG+'/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg', bio: 'American actor known for playing Iron Man in the Marvel Cinematic Universe.', birth_date: '1965-04-04' },
  { name: 'Scarlett Johansson',  picture_url: TMDB_IMG+'/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg', bio: 'American actress known for her roles as Black Widow in the MCU.', birth_date: '1984-11-22' },
  { name: 'Bryan Cranston',      picture_url: TMDB_IMG+'/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg', bio: 'American actor best known for his role as Walter White in Breaking Bad.', birth_date: '1956-03-07' },
  { name: 'Aaron Paul',          picture_url: TMDB_IMG+'/rQZi2kJnPGMf25TJz32GgdtA0Te.jpg', bio: 'American actor known for his role as Jesse Pinkman in Breaking Bad.', birth_date: '1979-08-27' },
  { name: 'Christopher Nolan',   picture_url: TMDB_IMG+'/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg', bio: 'British-American filmmaker known for complex, intellectually ambitious films.', birth_date: '1970-07-30' },
  { name: 'Martin Scorsese',     picture_url: TMDB_IMG+'/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg', bio: 'American director, producer, and screenwriter known for crime and drama films.', birth_date: '1942-11-17' },
  { name: 'Steven Spielberg',    picture_url: TMDB_IMG+'/tZxcg19YQ3e8fJ0pOs7hjlnmmzo.jpg', bio: 'American film director, producer, and screenwriter. One of the most influential directors in history.', birth_date: '1946-12-18' },
  { name: 'Quentin Tarantino',   picture_url: TMDB_IMG+'/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg', bio: 'American filmmaker known for nonlinear storylines and stylized violence.', birth_date: '1963-03-27' },
  { name: 'Benedict Cumberbatch',picture_url: TMDB_IMG+'/d3e3GWYBLdB4F5XpBnO7tqYlJt2.jpg', bio: 'English actor known for playing Sherlock Holmes and Doctor Strange.', birth_date: '1976-07-19' },
  { name: 'Millie Bobby Brown',  picture_url: TMDB_IMG+'/4gc42DRBDBbXFRUHMZAqnkuJGEX.jpg', bio: 'British actress and model known for her role as Eleven in Stranger Things.', birth_date: '2004-02-19' },
  { name: 'Winona Ryder',        picture_url: TMDB_IMG+'/xnRPoFI9vadF4TIkkA9scfMVUqf.jpg', bio: 'American actress known for Beetlejuice, Edward Scissorhands, and Stranger Things.', birth_date: '1971-10-29' },
];

// title_name -> [{ person_name, role, character_name }]
const castMap = {
  'The Shawshank Redemption': [
    { person: 'Tim Robbins',       role: 'Actor',    character: 'Andy Dufresne' },
    { person: 'Morgan Freeman',    role: 'Actor',    character: 'Ellis Boyd "Red" Redding' },
  ],
  'The Godfather': [
    { person: 'Marlon Brando',     role: 'Actor',    character: 'Vito Corleone' },
    { person: 'Al Pacino',         role: 'Actor',    character: 'Michael Corleone' },
  ],
  'The Dark Knight': [
    { person: 'Christian Bale',    role: 'Actor',    character: 'Bruce Wayne / Batman' },
    { person: 'Heath Ledger',      role: 'Actor',    character: 'The Joker' },
    { person: 'Christopher Nolan', role: 'Director', character: null },
  ],
  'Inception': [
    { person: 'Leonardo DiCaprio', role: 'Actor',    character: 'Dom Cobb' },
    { person: 'Christopher Nolan', role: 'Director', character: null },
  ],
  'Interstellar': [
    { person: 'Matthew McConaughey',role:'Actor',    character: 'Cooper' },
    { person: 'Anne Hathaway',     role: 'Actor',    character: 'Dr. Amelia Brand' },
    { person: 'Christopher Nolan', role: 'Director', character: null },
  ],
  'Forrest Gump': [
    { person: 'Tom Hanks',         role: 'Actor',    character: 'Forrest Gump' },
    { person: 'Robin Wright',      role: 'Actor',    character: 'Jenny Curran' },
    { person: 'Steven Spielberg',  role: 'Director', character: null },
  ],
  'Pulp Fiction': [
    { person: 'Quentin Tarantino', role: 'Director', character: null },
  ],
  'The Matrix': [
    { person: 'Keanu Reeves',      role: 'Actor',    character: 'Neo' },
  ],
  'Avengers: Endgame': [
    { person: 'Robert Downey Jr.', role: 'Actor',    character: 'Tony Stark / Iron Man' },
    { person: 'Scarlett Johansson',role: 'Actor',    character: 'Natasha Romanoff / Black Widow' },
  ],
  'Joker': [
    { person: 'Joaquin Phoenix',   role: 'Actor',    character: 'Arthur Fleck / Joker' },
  ],
  'Oppenheimer': [
    { person: 'Cillian Murphy',    role: 'Actor',    character: 'J. Robert Oppenheimer' },
    { person: 'Christopher Nolan', role: 'Director', character: null },
  ],
  'The Wolf of Wall Street': [
    { person: 'Leonardo DiCaprio', role: 'Actor',    character: 'Jordan Belfort' },
    { person: 'Martin Scorsese',   role: 'Director', character: null },
  ],
  'Goodfellas': [
    { person: 'Martin Scorsese',   role: 'Director', character: null },
  ],
  'Breaking Bad': [
    { person: 'Bryan Cranston',    role: 'Actor',    character: 'Walter White' },
    { person: 'Aaron Paul',        role: 'Actor',    character: 'Jesse Pinkman' },
  ],
  'Sherlock': [
    { person: 'Benedict Cumberbatch', role:'Actor',  character: 'Sherlock Holmes' },
  ],
  'Stranger Things': [
    { person: 'Millie Bobby Brown', role: 'Actor',   character: 'Eleven' },
    { person: 'Winona Ryder',       role: 'Actor',   character: 'Joyce Byers' },
  ],
};

const sampleUsers = [
  { username: 'cinephile99',  email: 'cinephile99@example.com',  password: 'Test1234!' },
  { username: 'moviebuff42',  email: 'moviebuff42@example.com',  password: 'Test1234!' },
  { username: 'screenaddict', email: 'screenaddict@example.com', password: 'Test1234!' },
];

async function seed() {
  const bcrypt = require('bcryptjs');
  await poolConnect;
  console.log('Connected to database. Starting seed...');

  // ── Genres ──────────────────────────────────────────────
  console.log('Seeding genres...');
  for (const g of genres) {
    try {
      const exists = await pool.request()
        .input('name', sql.VarChar, g)
        .query('SELECT 1 FROM Genres WHERE genre_name = @name');
      if (exists.recordset.length === 0) {
        await pool.request()
          .input('name', sql.VarChar, g)
          .query('INSERT INTO Genres (genre_name) VALUES (@name)');
      }
    } catch (e) { console.warn('Genre skip:', g, e.message); }
  }

  // ── Titles ───────────────────────────────────────────────
  console.log('Seeding titles...');
  const titleIdMap = {};
  for (const t of titles) {
    try {
      const exists = await pool.request()
        .input('title', sql.NVarChar, t.title)
        .input('type', sql.VarChar, t.type)
        .query('SELECT title_id FROM Titles WHERE title = @title AND type = @type');

      let titleId;
      if (exists.recordset.length > 0) {
        titleId = exists.recordset[0].title_id;
      } else {
        const ins = await pool.request()
          .input('title',       sql.NVarChar(256),  t.title)
          .input('type',        sql.VarChar(50),    t.type)
          .input('release_date',sql.Date,           t.release_date)
          .input('poster_url',  sql.VarChar(256),   t.poster_url)
          .input('cover_url',   sql.VarChar(256),   t.cover_url)
          .input('trailer_url', sql.VarChar(256),   t.trailer_url)
          .input('summary',     sql.Text,           t.summary)
          .query(`INSERT INTO Titles (title,type,release_date,poster_url,cover_url,trailer_url,summary)
                  OUTPUT INSERTED.title_id
                  VALUES (@title,@type,@release_date,@poster_url,@cover_url,@trailer_url,@summary)`);
        titleId = ins.recordset[0].title_id;
      }
      titleIdMap[t.title] = titleId;

      // Link genres
      for (const gName of t.genres) {
        try {
          const gRes = await pool.request()
            .input('name', sql.VarChar, gName)
            .query('SELECT genre_id FROM Genres WHERE genre_name = @name');
          if (gRes.recordset.length === 0) continue;
          const genreId = gRes.recordset[0].genre_id;
          const tgExists = await pool.request()
            .input('titleId', sql.Int, titleId)
            .input('genreId', sql.Int, genreId)
            .query('SELECT 1 FROM Title_Genres WHERE title_id=@titleId AND genre_id=@genreId');
          if (tgExists.recordset.length === 0) {
            await pool.request()
              .input('titleId', sql.Int, titleId)
              .input('genreId', sql.Int, genreId)
              .query('INSERT INTO Title_Genres (title_id,genre_id) VALUES (@titleId,@genreId)');
          }
        } catch {}
      }
    } catch (e) { console.warn('Title skip:', t.title, e.message); }
  }

  // ── People ───────────────────────────────────────────────
  console.log('Seeding people...');
  const personIdMap = {};
  for (const p of people) {
    try {
      const exists = await pool.request()
        .input('name', sql.NVarChar, p.name)
        .query('SELECT people_id FROM People WHERE name = @name');
      let personId;
      if (exists.recordset.length > 0) {
        personId = exists.recordset[0].people_id;
      } else {
        const ins = await pool.request()
          .input('name',        sql.NVarChar(256),  p.name)
          .input('picture_url', sql.VarChar(256),   p.picture_url)
          .input('bio',         sql.Text,           p.bio)
          .input('birth_date',  sql.Date,           p.birth_date)
          .query(`INSERT INTO People (name,picture_url,bio,birth_date)
                  OUTPUT INSERTED.people_id VALUES (@name,@picture_url,@bio,@birth_date)`);
        personId = ins.recordset[0].people_id;
      }
      personIdMap[p.name] = personId;
    } catch (e) { console.warn('Person skip:', p.name, e.message); }
  }

  // ── Cast ────────────────────────────────────────────────
  console.log('Seeding cast...');
  for (const [titleName, castList] of Object.entries(castMap)) {
    const titleId = titleIdMap[titleName];
    if (!titleId) continue;
    for (const c of castList) {
      const personId = personIdMap[c.person];
      if (!personId) continue;
      try {
        const exists = await pool.request()
          .input('titleId', sql.Int, titleId)
          .input('personId',sql.Int, personId)
          .input('role',    sql.VarChar, c.role)
          .query('SELECT 1 FROM MTS_CAST WHERE title_id=@titleId AND people_id=@personId AND role=@role');
        if (exists.recordset.length === 0) {
          await pool.request()
            .input('titleId',   sql.Int,         titleId)
            .input('personId',  sql.Int,         personId)
            .input('role',      sql.VarChar(50), c.role)
            .input('character', sql.NVarChar(256), c.character)
            .query('INSERT INTO MTS_CAST (title_id,people_id,role,character_name) VALUES (@titleId,@personId,@role,@character)');
        }
      } catch (e) { console.warn('Cast skip:', titleName, c.person, e.message); }
    }
  }

  // ── Sample users & reviews ───────────────────────────────
  console.log('Seeding sample users...');
  const userIds = [];
  for (const u of sampleUsers) {
    try {
      const exists = await pool.request()
        .input('email', sql.VarChar, u.email)
        .query('SELECT user_id FROM Users WHERE email = @email');
      if (exists.recordset.length > 0) {
        userIds.push(exists.recordset[0].user_id);
      } else {
        const hash = await bcrypt.hash(u.password, 10);
        const ins = await pool.request()
          .input('username', sql.VarChar, u.username)
          .input('email',    sql.VarChar, u.email)
          .input('hash',     sql.VarChar, hash)
          .query('INSERT INTO Users (username,email,pass_hash) OUTPUT INSERTED.user_id VALUES (@username,@email,@hash)');
        userIds.push(ins.recordset[0].user_id);
      }
    } catch (e) { console.warn('User skip:', u.username, e.message); }
  }

  // Sample reviews spread across movies
  const reviewData = [
    { title: 'The Shawshank Redemption', userIdx: 0, rating: 10, comment: 'Absolute masterpiece. A story of hope that never gets old.' },
    { title: 'The Dark Knight',          userIdx: 0, rating: 10, comment: 'Heath Ledger\'s Joker is one of cinema\'s greatest performances.' },
    { title: 'Inception',                userIdx: 0, rating: 9,  comment: 'Mindbending and thrilling. Nolan at his best.' },
    { title: 'The Godfather',            userIdx: 1, rating: 10, comment: 'The pinnacle of storytelling in cinema.' },
    { title: 'Interstellar',             userIdx: 1, rating: 9,  comment: 'Visually stunning with an emotional core that hits hard.' },
    { title: 'Breaking Bad',             userIdx: 1, rating: 10, comment: 'Best TV show ever made. Bryan Cranston is phenomenal.' },
    { title: 'Parasite',                 userIdx: 2, rating: 9,  comment: 'Brilliantly crafted. Bong Joon-ho is a genius.' },
    { title: 'Joker',                    userIdx: 2, rating: 8,  comment: 'Joaquin Phoenix transforms himself completely.' },
    { title: 'Oppenheimer',              userIdx: 2, rating: 9,  comment: 'Three hours fly by. Cillian Murphy deserved every award.' },
    { title: 'Stranger Things',          userIdx: 0, rating: 8,  comment: 'Nostalgia done perfectly. Millie Bobby Brown is outstanding.' },
    { title: 'Game of Thrones',          userIdx: 1, rating: 8,  comment: 'First 6 seasons are some of the best TV ever made.' },
    { title: 'Fight Club',               userIdx: 0, rating: 9,  comment: 'A cultural touchstone. The twist still lands.' },
    { title: 'The Matrix',               userIdx: 1, rating: 9,  comment: 'Changed action cinema forever. Iconic.' },
    { title: 'Pulp Fiction',             userIdx: 2, rating: 9,  comment: 'Tarantino at his most creative and entertaining.' },
    { title: 'La La Land',               userIdx: 0, rating: 8,  comment: 'Beautiful and bittersweet. A love letter to dreamers.' },
    { title: 'Whiplash',                 userIdx: 1, rating: 9,  comment: 'Intense and gripping. The final performance is electrifying.' },
    { title: 'Chernobyl',                userIdx: 2, rating: 10, comment: 'One of the most important and well-made TV series ever.' },
    { title: 'Sherlock',                 userIdx: 0, rating: 9,  comment: 'Cumberbatch redefines the character for a new generation.' },
    { title: 'The Wolf of Wall Street',  userIdx: 1, rating: 8,  comment: 'DiCaprio at his most charismatic. Scorsese at his craziest.' },
    { title: 'Forrest Gump',             userIdx: 2, rating: 9,  comment: 'Timeless. Tom Hanks is simply magical.' },
  ];

  console.log('Seeding reviews...');
  for (const rv of reviewData) {
    const titleId = titleIdMap[rv.title];
    const userId  = userIds[rv.userIdx];
    if (!titleId || !userId) continue;
    try {
      const exists = await pool.request()
        .input('userId',  sql.Int, userId)
        .input('titleId', sql.Int, titleId)
        .query('SELECT 1 FROM Reviews WHERE user_id=@userId AND title_id=@titleId');
      if (exists.recordset.length === 0) {
        await pool.request()
          .input('rating',  sql.Int,  rv.rating)
          .input('comment', sql.Text, rv.comment)
          .input('userId',  sql.Int,  userId)
          .input('titleId', sql.Int,  titleId)
          .query('INSERT INTO Reviews (rating,comment,user_id,title_id) VALUES (@rating,@comment,@userId,@titleId)');
      }
    } catch (e) { console.warn('Review skip:', rv.title, e.message); }
  }

  console.log('Seed complete!');
  await pool.close();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
