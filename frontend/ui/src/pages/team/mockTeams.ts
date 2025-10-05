export const mockTeams = [
    {
        id: 1,
        name: 'Manchester City',
        crest: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        manager: {
            name: 'Pep Guardiola',
            nationality: 'Spain',
            image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Pep_Guardiola_2017.jpg'
        },
        founded: 1880,
        stadium: 'Etihad Stadium',
        squad: [
            { name: 'Erling Haaland', position: 'Striker', age: 24, nationality: 'Norway' },
            { name: 'Kevin De Bruyne', position: 'Midfielder', age: 33, nationality: 'Belgium' },
            { name: 'Rúben Dias', position: 'Defender', age: 28, nationality: 'Portugal' }
        ],
        transfers: {
            ins: [{ name: 'Joško Gvardiol', fee: '£78M' }, { name: 'Matheus Nunes', fee: '£53M' }],
            outs: [{ name: 'İlkay Gündoğan', fee: 'Free (Barcelona)' }]
        },
        achievements: [
            { title: 'Premier League', years: [2012, 2014, 2018, 2019, 2021, 2022, 2023] },
            { title: 'Champions League', years: [2023] },
            { title: 'FA Cup', years: [2011, 2019, 2023] }
        ],
        fixtures: [
            { opponent: 'Liverpool', date: '2024-10-01', home: true, competition: 'Champions League' },
            { opponent: 'Arsenal', date: '2024-10-15', home: false, competition: 'FA Cup' }
        ]
    },
    {
        id: 2,
        name: 'Arsenal',
        crest: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
        manager: {
            name: 'Mikel Arteta',
            nationality: 'Spain',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mikel_Arteta_2015.jpg/220px-Mikel_Arteta_2015.jpg'
        },
        founded: 1886,
        stadium: 'Emirates Stadium',
        squad: [
            { name: 'Bukayo Saka', position: 'Winger', age: 22, nationality: 'England' },
            { name: 'Declan Rice', position: 'Midfielder', age: 25, nationality: 'England' },
            { name: 'William Saliba', position: 'Defender', age: 24, nationality: 'France' }
        ],
        transfers: {
            ins: [{ name: 'Kai Havertz', fee: '£65M' }],
            outs: [{ name: 'Granit Xhaka', fee: '£20M' }]
        },
        achievements: [
            { title: 'Premier League', years: [1998, 2002, 2004] },
            { title: 'FA Cup', years: [2014, 2015, 2017, 2020] }
        ],
        fixtures: [
            { opponent: 'Man City', date: '2024-10-15', home: true, competition: 'Premier League' },
            { opponent: 'Chelsea', date: '2024-10-22', home: false, competition: 'Premier League' }
        ]
    },
    {
        id: 3,
        name: 'Liverpool',
        crest: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
        manager: {
            name: 'Jürgen Klopp',
            nationality: 'Germany',
            image: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Juergen_Klopp_2019.jpg'
        },
        founded: 1892,
        stadium: 'Anfield',
        squad: [
            { name: 'Mohamed Salah', position: 'Forward', age: 32, nationality: 'Egypt' },
            { name: 'Virgil van Dijk', position: 'Defender', age: 33, nationality: 'Netherlands' },
            { name: 'Alisson Becker', position: 'Goalkeeper', age: 32, nationality: 'Brazil' }
        ],
        transfers: {
            ins: [{ name: 'Dominik Szoboszlai', fee: '£60M' }],
            outs: [{ name: 'Fabinho', fee: '£40M (Al-Ittihad)' }]
        },
        achievements: [
            { title: 'Premier League', years: [2020] },
            { title: 'Champions League', years: [2005, 2019] }
        ],
        fixtures: [
            { opponent: 'Manchester United', date: '2024-10-08', home: true, competition: 'Premier League' },
            { opponent: 'Manchester City', date: '2024-10-01', home: false, competition: 'Premier League' }
        ]
    },
    {
        id: 4,
        name: 'Chelsea',
        crest: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
        manager: {
            name: 'Mauricio Pochettino',
            nationality: 'Argentina',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Mauricio_Pochettino_2019.jpg/220px-Mauricio_Pochettino_2019.jpg'
        },
        founded: 1905,
        stadium: 'Stamford Bridge',
        squad: [
            { name: 'Enzo Fernández', position: 'Midfielder', age: 24, nationality: 'Argentina' },
            { name: 'Christopher Nkunku', position: 'Forward', age: 26, nationality: 'France' }
        ],
        transfers: {
            ins: [{ name: 'Cole Palmer', fee: '£42.5M' }],
            outs: [{ name: 'Mason Mount', fee: '£55M (Man Utd)' }]
        },
        achievements: [
            { title: 'Premier League', years: [2005, 2006, 2010, 2015, 2017] },
            { title: 'Champions League', years: [2012, 2021] }
        ],
        fixtures: [
            { opponent: 'Tottenham', date: '2024-10-11', home: true, competition: 'Premier League' },
            { opponent: 'Arsenal', date: '2024-10-22', home: true, competition: 'Premier League' }
        ]
    },
    {
        id: 5,
        name: 'Tottenham Hotspur',
        crest: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
        manager: {
            name: 'Ange Postecoglou',
            nationality: 'Australia',
            image: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Ange_Postecoglou_2017.jpg'
        },
        founded: 1882,
        stadium: 'Tottenham Hotspur Stadium',
        squad: [
            { name: 'Son Heung-min', position: 'Forward', age: 33, nationality: 'South Korea' },
            { name: 'James Maddison', position: 'Midfielder', age: 28, nationality: 'England' }
        ],
        transfers: {
            ins: [{ name: 'Guglielmo Vicario', fee: '£17.2M' }],
            outs: [{ name: 'Harry Kane', fee: '£100M (Bayern Munich)' }]
        },
        achievements: [
            { title: 'League Cup', years: [1971, 1973, 1999, 2008] },
            { title: 'FA Cup', years: [1901, 1921, 1961, 1962, 1967, 1981, 1982, 1991] }
        ],
        fixtures: [
            { opponent: 'Chelsea', date: '2024-10-11', home: false, competition: 'Premier League' },
            { opponent: 'Manchester United', date: '2024-10-19', home: true, competition: 'Premier League' }
        ]
    }
];
