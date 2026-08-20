import { FlightOffer } from '@/lib/mock-flights';
import { AIRLINES } from '@/lib/constants';

const ITALIAN_ORIGINS = ['MXP', 'LIN', 'BGY', 'FCO', 'CIA', 'NAP', 'VCE', 'FLR', 'BLQ', 'TRN', 'CTA', 'PMO', 'BRI', 'PSA', 'GOA'] as const;
const SEARCH_WINDOW_DAYS = 14;
const MAX_OFFERS = 50;

const AIRLINE_NAMES = Object.fromEntries(AIRLINES.map((a) => [a.code, a.name]));

interface TravelpayoutsFlightItem {
  origin: string;
  destination: string;
  origin_airport?: string;
  destination_airport?: string;
  price: number;
  currency?: string;
  airline: string;
  departure_at: string;
  return_at?: string;
  link?: string;
}

interface TravelpayoutsResponse {
  success: boolean;
  data?: TravelpayoutsFlightItem[] | Record<string, TravelpayoutsFlightItem>;
  error?: string | null;
}

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function buildBookingUrl(link: string | undefined, origin: string, destination: string): string {
  if (link) {
    const url = new URL(link, 'https://www.aviasales.com');
    // Only append currency params if not already present
    if (!url.searchParams.has('currency')) url.searchParams.set('currency', 'EUR');
    if (!url.searchParams.has('market')) url.searchParams.set('market', 'it');
    return url.toString();
  }

  // Fallback: Google Flights with EUR currency specified in URL
  return `https://www.google.com/travel/flights?q=Flights+to+${destination}+from+${origin}&curr=EUR`;
}

function resolveAirlineName(code: string): string {
  return AIRLINE_NAMES[code] ?? code;
}

function isLastMinuteOffer(departureAt: string, price: number, forced = false): boolean {
  if (forced) return true;

  const departure = new Date(departureAt);
  const daysUntilDeparture = (departure.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysUntilDeparture <= 3 || price < 50;
}

function mapToFlightOffer(item: TravelpayoutsFlightItem, isSpecialOffer = false): FlightOffer {
  const origin = item.origin_airport || item.origin;
  const destination = item.destination_airport || item.destination;

  const price = Number(item.price);

  return {
    origin,
    destination,
    airline: resolveAirlineName(item.airline),
    price,
    currency: (item.currency || 'EUR').toUpperCase(),
    departure_date: new Date(item.departure_at).toISOString(),
    return_date: item.return_at ? new Date(item.return_at).toISOString() : undefined,
    booking_url: buildBookingUrl(item.link, origin, destination),
    is_last_minute: isLastMinuteOffer(item.departure_at, price, isSpecialOffer),
  };
}

function isWithinSearchWindow(departureAt: string, windowEnd: Date): boolean {
  const departure = new Date(departureAt);
  const now = new Date();
  return departure >= now && departure <= windowEnd;
}

function offerKey(item: TravelpayoutsFlightItem): string {
  return `${item.origin_airport || item.origin}-${item.destination_airport || item.destination}-${item.departure_at}-${item.price}`;
}

async function fetchTravelpayouts<T extends TravelpayoutsResponse>(
  url: URL,
  apiToken: string,
): Promise<T | null> {
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Access-Token': apiToken,
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
  });

  if (!res.ok) {
    console.error(`Travelpayouts API error (${res.status}): ${url.pathname}`);
    return null;
  }

  return res.json() as Promise<T>;
}

function responseItems(data: TravelpayoutsResponse['data']): TravelpayoutsFlightItem[] {
  if (Array.isArray(data)) return data;
  return data ? Object.values(data) : [];
}

function appendCommonParams(url: URL, apiToken: string): void {
  url.searchParams.set('currency', 'eur');
  url.searchParams.set('market', 'it');
  url.searchParams.set('token', apiToken);
}

async function fetchCheapRoutesFromOrigin(
  origin: string,
  apiToken: string,
  windowEnd: Date,
  seen: Set<string>,
  offers: FlightOffer[],
): Promise<void> {
  const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
  url.searchParams.set('origin', origin);
  url.searchParams.set('unique', 'true');
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('limit', '30');
  url.searchParams.set('one_way', 'true');
  url.searchParams.set('departure_at', formatMonth(new Date()));
  appendCommonParams(url, apiToken);

  const json = await fetchTravelpayouts<TravelpayoutsResponse>(url, apiToken);
  if (!json?.success) return;

  for (const item of responseItems(json.data)) {
    if (!Number.isFinite(Number(item.price))) continue;
    if (!isWithinSearchWindow(item.departure_at, windowEnd)) continue;

    const key = offerKey(item);
    if (seen.has(key)) continue;
    seen.add(key);

    offers.push(mapToFlightOffer(item));
  }
}

async function fetchSpecialOffersFromOrigin(
  origin: string,
  apiToken: string,
  windowEnd: Date,
  seen: Set<string>,
  offers: FlightOffer[],
): Promise<void> {
  const url = new URL('https://api.travelpayouts.com/aviasales/v3/get_special_offers');
  url.searchParams.set('origin', origin);
  url.searchParams.set('locale', 'it');
  appendCommonParams(url, apiToken);

  const json = await fetchTravelpayouts<TravelpayoutsResponse>(url, apiToken);
  if (!json?.success) return;

  for (const item of responseItems(json.data)) {
    if (!Number.isFinite(Number(item.price))) continue;
    if (!isWithinSearchWindow(item.departure_at, windowEnd)) continue;

    const key = offerKey(item);
    if (seen.has(key)) continue;
    seen.add(key);

    offers.push(mapToFlightOffer(item, true));
  }
}

export async function fetchTravelpayoutsFlightOffers(apiToken: string): Promise<FlightOffer[]> {
  const offers: FlightOffer[] = [];
  const seen = new Set<string>();
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + SEARCH_WINDOW_DAYS);

  await Promise.all(
    ITALIAN_ORIGINS.map(async (origin) => {
      await fetchCheapRoutesFromOrigin(origin, apiToken, windowEnd, seen, offers);
      await fetchSpecialOffersFromOrigin(origin, apiToken, windowEnd, seen, offers);
    }),
  );

  return offers.sort((a, b) => a.price - b.price).slice(0, MAX_OFFERS);
}
