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
  MXP: 'Italia',
  LIN: 'Italia',
  BGY: 'Italia',
  FCO: 'Italia',
  CIA: 'Italia',
  NAP: 'Italia',
  VCE: 'Italia',
  FLR: 'Italia',
  BLQ: 'Italia',
  PSA: 'Italia',
  CTA: 'Italia',
  PMO: 'Italia',
  BRI: 'Italia',
  TRN: 'Italia',
  BCN: 'Spagna',
  MAD: 'Spagna',
  CDG: 'Francia',
  ORY: 'Francia',
  LHR: 'Regno Unito',
  STN: 'Regno Unito',
  LGW: 'Regno Unito',
  LTN: 'Regno Unito',
  FRA: 'Germania',
  MUC: 'Germania',
  AMS: 'Paesi Bassi',
  ATH: 'Grecia',
  LIS: 'Portogallo',
  OPO: 'Portogallo',
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
};


export function getCityName(code: string): string {
  const upperCode = code.toUpperCase();
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

