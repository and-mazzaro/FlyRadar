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
  const airlines = ['Ryanair', 'EasyJet', 'Wizz Air', 'Vueling', 'ITA Airways', 'Lufthansa', 'Air France'];
  const origins = ['MXP', 'LIN', 'BGY', 'FCO', 'CIA'];
  const destinations = ['BCN', 'MAD', 'CDG', 'ORY', 'LHR', 'STN', 'FRA', 'AMS', 'ATH', 'LIS'];

  const offers: FlightOffer[] = [];
  const now = new Date();

  // Generate 15-20 random deals
  const totalDeals = Math.floor(Math.random() * 10) + 12;

  for (let i = 0; i < totalDeals; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    let destination = destinations[Math.floor(Math.random() * destinations.length)];
    while (destination === origin) {
      destination = destinations[Math.floor(Math.random() * destinations.length)];
    }

    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const price = parseFloat((Math.random() * 85 + 15).toFixed(2)); // Random deal between 15 and 100 EUR
    const isLastMinute = Math.random() > 0.6;
    
    // Departure date within 1 to 14 days
    const departureDaysAhead = Math.floor(Math.random() * 14) + 1;
    const departureDate = new Date(now);
    departureDate.setDate(now.getDate() + departureDaysAhead);
    departureDate.setHours(8 + Math.floor(Math.random() * 12), 0, 0, 0);

    // Return date within 2 to 7 days after departure (optional)
    let returnDate: string | undefined = undefined;
    if (Math.random() > 0.4) {
      const returnDaysAfter = Math.floor(Math.random() * 5) + 2;
      const retDate = new Date(departureDate);
      retDate.setDate(departureDate.getDate() + returnDaysAfter);
      retDate.setHours(10 + Math.floor(Math.random() * 10), 0, 0, 0);
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
      // Internal redirect API trigger
      booking_url: `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}`,
      is_last_minute: isLastMinute,
    });
  }

  return offers;
}
