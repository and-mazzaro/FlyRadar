import { EXTRA_EU_DESTINATIONS } from '@/lib/constants';

export interface FlightOffer {
  origin: string;
  destination: string;
  airline: string;
  price: number;
  currency: string;
  departure_date: string;
  return_date?: string;
  booking_url: string;
  is_last_minute: boolean;
}

// Generates flight mock data simulating external flight searches (e.g. Travelpayouts Aviasales)
export function getMockFlightOffers(): FlightOffer[] {
  const airlines = [
    'Ryanair', 'EasyJet', 'Wizz Air', 'Vueling', 'ITA Airways',
    'Lufthansa', 'Air France', 'Emirates', 'Turkish Airlines', 'British Airways'
  ];
  const origins = ['MXP', 'LIN', 'BGY', 'FCO', 'CIA', 'NAP', 'VCE', 'BLQ', 'CTA'];

  // Mix of domestic, European, and international long-haul destinations
  const domesticDests = ['CTA', 'PMO', 'NAP', 'VCE', 'BLQ', 'BRI', 'FCO', 'MXP', 'CAG', 'SUF'];
  const europeDests = ['BCN', 'MAD', 'CDG', 'ORY', 'LHR', 'STN', 'FRA', 'AMS', 'ATH', 'LIS', 'PRG', 'VIE', 'BER', 'ZRH'];
  const intercontinentalDests = [...EXTRA_EU_DESTINATIONS];

  const offers: FlightOffer[] = [];
  const now = new Date();

  // Generate 40-50 diverse deals (mix of domestic and international)
  const totalDeals = Math.floor(Math.random() * 10) + 40;

  for (let i = 0; i < totalDeals; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    
    // Choose route type: 35% domestic, 45% Europe, 20% Intercontinental
    const routeTypeRoll = Math.random();
    let destinationCategory: string[];
    let price: number;

    if (routeTypeRoll < 0.35) {
      destinationCategory = domesticDests;
      price = parseFloat((Math.random() * 65 + 18).toFixed(2)); // €18 - €83
    } else if (routeTypeRoll < 0.80) {
      destinationCategory = europeDests;
      price = parseFloat((Math.random() * 160 + 29).toFixed(2)); // €29 - €189
    } else {
      destinationCategory = intercontinentalDests;
      price = parseFloat((Math.random() * 550 + 260).toFixed(2)); // €260 - €810
    }

    let destination = destinationCategory[Math.floor(Math.random() * destinationCategory.length)];
    while (destination === origin) {
      destination = destinationCategory[Math.floor(Math.random() * destinationCategory.length)];
    }

    const airline = airlines[Math.floor(Math.random() * airlines.length)];

    // Departure date within 1 to 90 days (long term search horizon)
    const departureDaysAhead = Math.floor(Math.random() * 90) + 1;
    const isLastMinute = departureDaysAhead <= 3;

    const departureDate = new Date(now);
    departureDate.setDate(now.getDate() + departureDaysAhead);
    departureDate.setHours(6 + Math.floor(Math.random() * 16), 0, 0, 0);

    // Return date within 2 to 14 days after departure (optional)
    let returnDate: string | undefined = undefined;
    if (Math.random() > 0.3) {
      const returnDaysAfter = Math.floor(Math.random() * 10) + 2;
      const retDate = new Date(departureDate);
      retDate.setDate(departureDate.getDate() + returnDaysAfter);
      retDate.setHours(8 + Math.floor(Math.random() * 14), 0, 0, 0);
      returnDate = retDate.toISOString();
    }

    offers.push({
      origin,
      destination,
      airline,
      price,
      currency: 'EUR',
      departure_date: departureDate.toISOString(),
      return_date: returnDate,
      booking_url: `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}`,
      is_last_minute: isLastMinute,
    });
  }

  return offers;
}

