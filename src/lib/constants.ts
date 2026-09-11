export const AIRLINES = [
  { code: 'FR', name: 'Ryanair' },
  { code: 'EJU', name: 'EasyJet' },
  { code: 'W4', name: 'Wizz Air' },
  { code: 'VY', name: 'Vueling' },
  { code: 'AZ', name: 'ITA Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'IB', name: 'Iberia' },
  { code: 'AF', name: 'Air France' },
];

export const AIRPORTS = [
  { code: 'MXP', city: 'Milano Malpensa' },
  { code: 'LIN', city: 'Milano Linate' },
  { code: 'BGY', city: 'Bergamo Orio al Serio' },
  { code: 'FCO', city: 'Roma Fiumicino' },
  { code: 'CIA', city: 'Roma Ciampino' },
  { code: 'BCN', city: 'Barcellona El Prat' },
  { code: 'MAD', city: 'Madrid Barajas' },
  { code: 'CDG', city: 'Parigi Charles de Gaulle' },
  { code: 'ORY', city: 'Parigi Orly' },
  { code: 'LHR', city: 'Londra Heathrow' },
  { code: 'STN', city: 'Londra Stansted' },
  { code: 'LGW', city: 'Londra Gatwick' },
  { code: 'FRA', city: 'Francoforte' },
  { code: 'MUC', city: 'Monaco di Baviera' },
  { code: 'AMS', city: 'Amsterdam Schiphol' },
  { code: 'ATH', city: 'Atene' },
  { code: 'LIS', city: 'Lisbona' },
];

export const AIRPORT_COUNTRIES: Record<string, string> = {
  // Italia
  MXP: 'Italia', LIN: 'Italia', BGY: 'Italia', FCO: 'Italia', CIA: 'Italia',
  NAP: 'Italia', VCE: 'Italia', FLR: 'Italia', BLQ: 'Italia', PSA: 'Italia',
  CTA: 'Italia', PMO: 'Italia', BRI: 'Italia', TRN: 'Italia', REG: 'Italia',
  GOA: 'Italia', CIY: 'Italia', SUF: 'Italia', PMF: 'Italia', RMI: 'Italia', VBS: 'Italia',
  // Spagna
  BCN: 'Spagna', MAD: 'Spagna', VLC: 'Spagna', SVQ: 'Spagna', AGP: 'Spagna',
  // Francia
  CDG: 'Francia', ORY: 'Francia', PAR: 'Francia', FCE: 'Francia', AJA: 'Francia',
  // Regno Unito
  LHR: 'Regno Unito', STN: 'Regno Unito', LGW: 'Regno Unito', LTN: 'Regno Unito', SEN: 'Regno Unito', LON: 'Regno Unito',
  // Germania
  FRA: 'Germania', MUC: 'Germania', BER: 'Germania', TXL: 'Germania', SXF: 'Germania',
  HAM: 'Germania', DUS: 'Germania', CGN: 'Germania', STR: 'Germania', NUE: 'Germania',
  // Paesi Bassi
  AMS: 'Paesi Bassi',
  // Grecia
  ATH: 'Grecia', SKG: 'Grecia', HER: 'Grecia', RHO: 'Grecia', CFU: 'Grecia',
  // Portogallo
  LIS: 'Portogallo', OPO: 'Portogallo', FAO: 'Portogallo',
  // Irlanda
  DUB: 'Irlanda', ORK: 'Irlanda',
  // Austria & Svizzera
  VIE: 'Austria', GRZ: 'Austria', ZRH: 'Svizzera', GVA: 'Svizzera',
  // Repubblica Ceca & Polonia & Ungheria
  PRG: 'Repubblica Ceca', WAW: 'Polonia', KRK: 'Polonia', WRO: 'Polonia', BUD: 'Ungheria',
  // Romania, Bulgaria, Albania, Balcani
  OTP: 'Romania', SOF: 'Bulgaria', TIA: 'Albania', SKP: 'Macedonia del Nord',
  BEG: 'Serbia', ZAG: 'Croazia', LJU: 'Slovenia', DBV: 'Croazia', SPU: 'Croazia', ZAD: 'Croazia',
  // Scandinavia
  CPH: 'Danimarca', ARN: 'Svezia', OSL: 'Norvegia', BGO: 'Norvegia', SVG: 'Norvegia',
  HEL: 'Finlandia', RIX: 'Lettonia', TLL: 'Estonia', VNO: 'Lituania', BRU: 'Belgio',
  // Turchia & Medio Oriente
  IST: 'Turchia', SAW: 'Turchia', ADB: 'Turchia', AYT: 'Turchia', ESB: 'Turchia',
  TLV: 'Israele', AMM: 'Giordania', BEY: 'Libano', DXB: 'Emirati Arabi Uniti',
  AUH: 'Emirati Arabi Uniti', DOH: 'Qatar', KWI: 'Kuwait', MCT: 'Oman',
  // Nord Africa
  CAI: 'Egitto', SSH: 'Egitto', HRG: 'Egitto', TUN: 'Tunisia', CMN: 'Marocco', RAK: 'Marocco', DJE: 'Tunisia',
  // Nord America
  JFK: 'Stati Uniti', LGA: 'Stati Uniti', EWR: 'Stati Uniti', LAX: 'Stati Uniti',
  ORD: 'Stati Uniti', MIA: 'Stati Uniti', BOS: 'Stati Uniti', SFO: 'Stati Uniti',
  IAD: 'Stati Uniti', MCO: 'Stati Uniti', ATL: 'Stati Uniti', DFW: 'Stati Uniti',
  LAS: 'Stati Uniti', SEA: 'Stati Uniti', DEN: 'Stati Uniti', PHX: 'Stati Uniti',
  YYZ: 'Canada', YUL: 'Canada', YVR: 'Canada', YYC: 'Canada',
  MEX: 'Messico', CUN: 'Messico', GDL: 'Messico',
  // Sud America, Caraibi & Africa
  GRU: 'Brasile', GIG: 'Brasile', EZE: 'Argentina', BOG: 'Colombia', LIM: 'Perù',
  SCL: 'Cile', MVD: 'Uruguay', PTY: 'Panama', SJO: 'Costa Rica', UIO: 'Ecuador',
  HAV: 'Cuba', PUJ: 'Repubblica Dominicana', SDQ: 'Repubblica Dominicana', MBJ: 'Giamaica', NAS: 'Bahamas',
  NBO: 'Kenya', JNB: 'Sud Africa', CPT: 'Sud Africa', ZNZ: 'Tanzania',
  ADD: 'Etiopia', MRU: 'Mauritius', SEZ: 'Seychelles', ALG: 'Algeria',
  AGA: 'Marocco', FEZ: 'Marocco', LOS: 'Nigeria', ACC: 'Ghana',
  // Asia & Oceania
  BKK: 'Thailandia', HKG: 'Hong Kong', SIN: 'Singapore', KUL: 'Malaysia', DPS: 'Indonesia', MLE: 'Maldive',
  DEL: 'India', BOM: 'India', BLR: 'India', CCU: 'India',
  NRT: 'Giappone', HND: 'Giappone', PEK: 'Cina', PVG: 'Cina', CAN: 'Cina',
  ICN: 'Corea del Sud', TPE: 'Taiwan', MNL: 'Filippine', CGK: 'Indonesia',
  SGN: 'Vietnam', HAN: 'Vietnam', CMB: 'Sri Lanka',
  SYD: 'Australia', MEL: 'Australia', PER: 'Australia', BNE: 'Australia', AKL: 'Nuova Zelanda',
  // Golfo Persico (extra)
  JED: 'Arabia Saudita', RUH: 'Arabia Saudita', BAH: 'Bahrein', SHJ: 'Emirati Arabi Uniti',
};

export const AIRPORT_TO_CITY_CODE: Record<string, string> = {
  // London
  STN: 'LON', LHR: 'LON', LGW: 'LON', LTN: 'LON', SEN: 'LON', LON: 'LON',
  // Milan
  MXP: 'MIL', LIN: 'MIL', BGY: 'MIL', MIL: 'MIL',
  // Rome
  FCO: 'ROM', CIA: 'ROM', ROM: 'ROM',
  // Paris
  CDG: 'PAR', ORY: 'PAR', PAR: 'PAR',
  // Madrid
  MAD: 'MAD',
  // Barcelona
  BCN: 'BCN',
  // Amsterdam
  AMS: 'AMS',
  // Athens
  ATH: 'ATH',
  // Lisbon
  LIS: 'LIS', OPO: 'OPO',
};

const CITY_NAME_MAP: Record<string, string> = {
  MXP: 'Milano',
  LIN: 'Milano',
  BGY: 'Bergamo',
  MIL: 'Milano',
  FCO: 'Roma',
  CIA: 'Roma',
  ROM: 'Roma',
  NAP: 'Napoli',
  VCE: 'Venezia',
  FLR: 'Firenze',
  BLQ: 'Bologna',
  PSA: 'Pisa',
  CTA: 'Catania',
  PMO: 'Palermo',
  BRI: 'Bari',
  TRN: 'Torino',
  REG: 'Reggio Calabria',
  GOA: 'Genova',
  CIY: 'Comiso',
  SUF: 'Lamezia Terme',
  BCN: 'Barcellona',
  MAD: 'Madrid',
  VLC: 'Valencia',
  SVQ: 'Siviglia',
  AGP: 'Malaga',
  CDG: 'Parigi',
  ORY: 'Parigi',
  PAR: 'Parigi',
  LHR: 'Londra',
  STN: 'Londra',
  LGW: 'Londra',
  LTN: 'Londra',
  LON: 'Londra',
  FRA: 'Francoforte',
  MUC: 'Monaco',
  BER: 'Berlino',
  TXL: 'Berlino',
  SXF: 'Berlino',
  HAM: 'Amburgo',
  DUS: 'Dusseldorf',
  CGN: 'Colonia',
  STR: 'Stoccarda',
  NUE: 'Norimberga',
  AMS: 'Amsterdam',
  ATH: 'Atene',
  SKG: 'Salonicco',
  HER: 'Heraklion',
  RHO: 'Rodi',
  CFU: 'Corfù',
  LIS: 'Lisbona',
  OPO: 'Porto',
  FAO: 'Faro',
  DUB: 'Dublino',
  ORK: 'Cork',
  VIE: 'Vienna',
  GRZ: 'Graz',
  PRG: 'Praga',
  WAW: 'Varsavia',
  KRK: 'Cracovia',
  WRO: 'Breslavia',
  BUD: 'Budapest',
  OTP: 'Bucarest',
  SOF: 'Sofia',
  TIA: 'Tirana',
  SKP: 'Skopje',
  BEG: 'Belgrado',
  ZAG: 'Zagabria',
  LJU: 'Lubiana',
  DBV: 'Dubrovnik',
  SPU: 'Spalato',
  ZAD: 'Zara',
  HRK: 'Kharkiv',
  CPH: 'Copenaghen',
  ARN: 'Stoccolma',
  OSL: 'Oslo',
  HEL: 'Helsinki',
  RIX: 'Riga',
  TLL: 'Tallinn',
  VNO: 'Vilnius',
  BRU: 'Bruxelles',
  ZRH: 'Zurigo',
  GVA: 'Ginevra',
  FCE: 'Figari',
  AJA: 'Ajaccio',
  PMF: 'Parma',
  RMI: 'Rimini',
  VBS: 'Brescia',
  BGO: 'Bergen',
  SVG: 'Stavanger',
  IST: 'Istanbul',
  SAW: 'Istanbul',
  ADB: 'Smirne',
  AYT: 'Antalya',
  ESB: 'Ankara',
  CAI: 'Il Cairo',
  TUN: 'Tunisi',
  CMN: 'Casablanca',
  RAK: 'Marrakech',
  DJE: 'Djerba',
  SSH: 'Sharm el-Sheikh',
  HRG: 'Hurghada',
  TLV: 'Tel Aviv',
  AMM: 'Amman',
  BEY: 'Beirut',
  DXB: 'Dubai',
  AUH: 'Abu Dhabi',
  DOH: 'Doha',
  KWI: 'Kuwait City',
  MCT: 'Muscat',
  JFK: 'New York',
  LGA: 'New York',
  EWR: 'New York',
  LAX: 'Los Angeles',
  ORD: 'Chicago',
  MIA: 'Miami',
  BOS: 'Boston',
  SFO: 'San Francisco',
  YYZ: 'Toronto',
  YUL: 'Montreal',
  GRU: 'São Paulo',
  EZE: 'Buenos Aires',
  BOG: 'Bogotà',
  MEX: 'Città del Messico',
  NBO: 'Nairobi',
  JNB: 'Johannesburg',
  CPT: 'Città del Capo',
  BKK: 'Bangkok',
  HKG: 'Hong Kong',
  SIN: 'Singapore',
  KUL: 'Kuala Lumpur',
  NRT: 'Tokyo',
  HND: 'Tokyo',
  PEK: 'Pechino',
  PVG: 'Shanghai',
  ICN: 'Seoul',
  SYD: 'Sydney',
  MEL: 'Melbourne',
  IAD: 'Washington',
  MCO: 'Orlando',
  ATL: 'Atlanta',
  DFW: 'Dallas',
  LAS: 'Las Vegas',
  SEA: 'Seattle',
  DEN: 'Denver',
  PHX: 'Phoenix',
  YVR: 'Vancouver',
  YYC: 'Calgary',
  GDL: 'Guadalajara',
  GIG: 'Rio de Janeiro',
  LIM: 'Lima',
  SCL: 'Santiago',
  MVD: 'Montevideo',
  PTY: 'Panama City',
  SJO: 'San José',
  UIO: 'Quito',
  HAV: 'L\'Avana',
  PUJ: 'Punta Cana',
  SDQ: 'Santo Domingo',
  MBJ: 'Montego Bay',
  NAS: 'Nassau',
  BOM: 'Mumbai',
  BLR: 'Bangalore',
  CCU: 'Calcutta',
  CAN: 'Guangzhou',
  TPE: 'Taipei',
  MNL: 'Manila',
  CGK: 'Giacarta',
  SGN: 'Ho Chi Minh City',
  HAN: 'Hanoi',
  CMB: 'Colombo',
  PER: 'Perth',
  BNE: 'Brisbane',
  AKL: 'Auckland',
  JED: 'Jeddah',
  RUH: 'Riyadh',
  BAH: 'Manama',
  SHJ: 'Sharjah',
  ADD: 'Addis Abeba',
  MRU: 'Mauritius',
  SEZ: 'Mahé',
  ALG: 'Algeri',
  AGA: 'Agadir',
  FEZ: 'Fes',
  LOS: 'Lagos',
  ACC: 'Accra',
  SEN: 'Londra',
};


export function getCityName(code: string): string {
  const upperCode = code.toUpperCase();

  const italianAirport = ITALIAN_AIRPORTS.find((a) => a.code === upperCode);
  if (italianAirport) return italianAirport.city;

  const extraEuAirport = EXTRA_EU_AIRPORTS.find((a) => a.code === upperCode);
  if (extraEuAirport) return extraEuAirport.city;

  if (CITY_NAME_MAP[upperCode]) return CITY_NAME_MAP[upperCode];

  const cityAliases: Record<string, string> = {
    LONDON: 'Londra',
    MILAN: 'Milano',
    ROME: 'Roma',
    PARIS: 'Parigi',
    MUNICH: 'Monaco',
    BARCELONA: 'Barcellona',
    LISBON: 'Lisbona',
    ATHENS: 'Atene',
    VIENNA: 'Vienna',
    AMSTERDAM: 'Amsterdam',
  };
  if (cityAliases[upperCode]) return cityAliases[upperCode];
  
  const airport = AIRPORTS.find(a => a.code === upperCode);
  if (airport) {
    // Return city part (before airport name)
    const firstWord = airport.city.split(' ')[0];
    return firstWord;
  }
  return code.trim();
}

export function matchesAirportOrCity(code: string, query: string): boolean {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedQuery = query.trim().toUpperCase();
  if (!normalizedQuery) return true;
  if (normalizedCode === normalizedQuery) return true;

  const cityCode = AIRPORT_TO_CITY_CODE[normalizedCode];
  const queryCityCode = AIRPORT_TO_CITY_CODE[normalizedQuery];
  if (cityCode && (cityCode === normalizedQuery || cityCode === queryCityCode)) return true;

  const cityName = getCityName(normalizedCode).toLowerCase();
  const queryName = normalizedQuery.toLowerCase();
  const aliases: Record<string, string[]> = {
    londra: ['london'],
    london: ['londra'],
    milano: ['milan'],
    milan: ['milano'],
    roma: ['rome'],
    rome: ['roma'],
    parigi: ['paris'],
    paris: ['parigi'],
    monaco: ['munich'],
    munich: ['monaco'],
    barcellona: ['barcelona'],
    barcelona: ['barcellona'],
  };

  return cityName === queryName || cityName.includes(queryName) ||
    (aliases[queryName] ?? []).includes(cityName);
}

export function getCurrencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'RUB': return '₽';
    default: return currency;
  }
}

export function getAirportCountry(code: string): string {
  const upperCode = code.trim().toUpperCase();
  if (AIRPORT_COUNTRIES[upperCode]) return AIRPORT_COUNTRIES[upperCode];
  
  // If code is a city code like MIL, ROM, PAR
  if (['MXP', 'LIN', 'BGY', 'MIL', 'FCO', 'CIA', 'ROM', 'NAP', 'VCE', 'FLR', 'BLQ', 'PSA', 'CTA', 'PMO', 'BRI', 'TRN'].includes(upperCode)) {
    return 'Italia';
  }
  if (['LON', 'STN', 'LHR', 'LGW', 'LTN'].includes(upperCode)) return 'Regno Unito';
  if (['PAR', 'CDG', 'ORY'].includes(upperCode)) return 'Francia';
  if (['BCN', 'MAD', 'VLC'].includes(upperCode)) return 'Spagna';

  return 'Estero';
}

export function isDomesticFlight(origin: string, destination: string, userCountry = 'Italia'): boolean {
  const originCountry = getAirportCountry(origin);
  const destCountry = getAirportCountry(destination);
  
  // Domestic if both airports belong to the user country or both belong to the same country
  if (originCountry === destCountry) return true;
  return false;
}

const EUROPEAN_COUNTRIES = [
  'Italia', 'Spagna', 'Francia', 'Regno Unito', 'Germania', 'Paesi Bassi',
  'Grecia', 'Portogallo', 'Irlanda', 'Austria', 'Svizzera', 'Repubblica Ceca',
  'Polonia', 'Ungheria', 'Romania', 'Bulgaria', 'Albania', 'Macedonia del Nord',
  'Serbia', 'Croazia', 'Slovenia', 'Danimarca', 'Svezia', 'Norvegia', 'Finlandia',
  'Lettonia', 'Estonia', 'Lituania', 'Belgio',
] as const;

/** Aeroporti italiani usati come origine — traduzione sotto ogni codice */
export const ITALIAN_AIRPORTS = [
  { code: 'MXP', city: 'Milano' },
  { code: 'LIN', city: 'Milano' },
  { code: 'BGY', city: 'Bergamo' },
  { code: 'FCO', city: 'Roma' },
  { code: 'CIA', city: 'Roma' },
  { code: 'NAP', city: 'Napoli' },
  { code: 'VCE', city: 'Venezia' },
  { code: 'FLR', city: 'Firenze' },
  { code: 'BLQ', city: 'Bologna' },
  { code: 'TRN', city: 'Torino' },
  { code: 'CTA', city: 'Catania' },
  { code: 'PMO', city: 'Palermo' },
  { code: 'BRI', city: 'Bari' },
  { code: 'PSA', city: 'Pisa' },
  { code: 'GOA', city: 'Genova' },
  { code: 'REG', city: 'Reggio Calabria' },
  { code: 'SUF', city: 'Lamezia Terme' },
  { code: 'PMF', city: 'Parma' },
  { code: 'RMI', city: 'Rimini' },
  { code: 'VBS', city: 'Brescia' },
  { code: 'CIY', city: 'Comiso' },
] as const;

export const ITALIAN_ORIGINS = ITALIAN_AIRPORTS.map((a) => a.code);

/**
 * Destinazioni extra-UE / extra-Schengen — traduzione sotto ogni codice
 */
export const EXTRA_EU_AIRPORTS = [
  // Nord America
  { code: 'JFK', city: 'New York' },
  { code: 'LGA', city: 'New York' },
  { code: 'EWR', city: 'New York' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'MIA', city: 'Miami' },
  { code: 'BOS', city: 'Boston' },
  { code: 'SFO', city: 'San Francisco' },
  { code: 'IAD', city: 'Washington' },
  { code: 'MCO', city: 'Orlando' },
  { code: 'ATL', city: 'Atlanta' },
  { code: 'DFW', city: 'Dallas' },
  { code: 'LAS', city: 'Las Vegas' },
  { code: 'SEA', city: 'Seattle' },
  { code: 'DEN', city: 'Denver' },
  { code: 'PHX', city: 'Phoenix' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'YUL', city: 'Montreal' },
  { code: 'YVR', city: 'Vancouver' },
  { code: 'YYC', city: 'Calgary' },
  { code: 'MEX', city: 'Città del Messico' },
  { code: 'CUN', city: 'Cancún' },
  { code: 'GDL', city: 'Guadalajara' },
  // Sud America & Caraibi
  { code: 'GRU', city: 'San Paolo' },
  { code: 'GIG', city: 'Rio de Janeiro' },
  { code: 'EZE', city: 'Buenos Aires' },
  { code: 'BOG', city: 'Bogotà' },
  { code: 'LIM', city: 'Lima' },
  { code: 'SCL', city: 'Santiago' },
  { code: 'MVD', city: 'Montevideo' },
  { code: 'PTY', city: 'Panama' },
  { code: 'SJO', city: 'San José' },
  { code: 'UIO', city: 'Quito' },
  { code: 'HAV', city: 'L\'Avana' },
  { code: 'PUJ', city: 'Punta Cana' },
  { code: 'SDQ', city: 'Santo Domingo' },
  { code: 'MBJ', city: 'Montego Bay' },
  { code: 'NAS', city: 'Nassau' },
  // Medio Oriente & Turchia
  { code: 'DXB', city: 'Dubai' },
  { code: 'AUH', city: 'Abu Dhabi' },
  { code: 'SHJ', city: 'Sharjah' },
  { code: 'DOH', city: 'Doha' },
  { code: 'IST', city: 'Istanbul' },
  { code: 'SAW', city: 'Istanbul' },
  { code: 'ADB', city: 'Smirne' },
  { code: 'AYT', city: 'Antalya' },
  { code: 'ESB', city: 'Ankara' },
  { code: 'TLV', city: 'Tel Aviv' },
  { code: 'AMM', city: 'Amman' },
  { code: 'BEY', city: 'Beirut' },
  { code: 'KWI', city: 'Kuwait' },
  { code: 'MCT', city: 'Mascate' },
  { code: 'JED', city: 'Gedda' },
  { code: 'RUH', city: 'Riyadh' },
  { code: 'BAH', city: 'Manama' },
  // Asia & Oceania
  { code: 'BKK', city: 'Bangkok' },
  { code: 'HKG', city: 'Hong Kong' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur' },
  { code: 'NRT', city: 'Tokyo' },
  { code: 'HND', city: 'Tokyo' },
  { code: 'PEK', city: 'Pechino' },
  { code: 'PVG', city: 'Shanghai' },
  { code: 'CAN', city: 'Canton' },
  { code: 'ICN', city: 'Seoul' },
  { code: 'TPE', city: 'Taipei' },
  { code: 'MNL', city: 'Manila' },
  { code: 'CGK', city: 'Giacarta' },
  { code: 'SGN', city: 'Ho Chi Minh' },
  { code: 'HAN', city: 'Hanoi' },
  { code: 'DPS', city: 'Bali' },
  { code: 'MLE', city: 'Maldive' },
  { code: 'DEL', city: 'Delhi' },
  { code: 'BOM', city: 'Mumbai' },
  { code: 'BLR', city: 'Bangalore' },
  { code: 'CCU', city: 'Calcutta' },
  { code: 'CMB', city: 'Colombo' },
  { code: 'SYD', city: 'Sydney' },
  { code: 'MEL', city: 'Melbourne' },
  { code: 'PER', city: 'Perth' },
  { code: 'BNE', city: 'Brisbane' },
  { code: 'AKL', city: 'Auckland' },
  // Nord Africa & Africa subsahariana
  { code: 'CAI', city: 'Il Cairo' },
  { code: 'SSH', city: 'Sharm el-Sheikh' },
  { code: 'HRG', city: 'Hurghada' },
  { code: 'RAK', city: 'Marrakech' },
  { code: 'CMN', city: 'Casablanca' },
  { code: 'AGA', city: 'Agadir' },
  { code: 'FEZ', city: 'Fes' },
  { code: 'TUN', city: 'Tunisi' },
  { code: 'DJE', city: 'Djerba' },
  { code: 'ALG', city: 'Algeri' },
  { code: 'NBO', city: 'Nairobi' },
  { code: 'JNB', city: 'Johannesburg' },
  { code: 'CPT', city: 'Città del Capo' },
  { code: 'ZNZ', city: 'Zanzibar' },
  { code: 'ADD', city: 'Addis Abeba' },
  { code: 'MRU', city: 'Mauritius' },
  { code: 'SEZ', city: 'Mahé' },
  { code: 'LOS', city: 'Lagos' },
  { code: 'ACC', city: 'Accra' },
  // Europa extra-Schengen / non-UE
  { code: 'LHR', city: 'Londra' },
  { code: 'LGW', city: 'Londra' },
  { code: 'STN', city: 'Londra' },
  { code: 'LTN', city: 'Londra' },
  { code: 'SEN', city: 'Londra' },
  { code: 'ZRH', city: 'Zurigo' },
  { code: 'GVA', city: 'Ginevra' },
  { code: 'TIA', city: 'Tirana' },
  { code: 'SKP', city: 'Skopje' },
  { code: 'BEG', city: 'Belgrado' },
] as const;

export const EXTRA_EU_DESTINATIONS = EXTRA_EU_AIRPORTS.map((a) => a.code);

export function isExtraEUFlight(origin: string, destination: string): boolean {
  const destCountry = getAirportCountry(destination);
  return !EUROPEAN_COUNTRIES.includes(destCountry as typeof EUROPEAN_COUNTRIES[number]);
}


