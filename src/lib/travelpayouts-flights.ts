import { FlightOffer } from '@/lib/mock-flights';
import {
  AIRLINES,
  ITALIAN_ORIGINS,
  isDomesticFlight,
  isExtraEUFlight,
} from '@/lib/constants';
const SEARCH_WINDOW_DAYS = 240;
const ROUTE_RESULT_LIMIT = 500;
const MAX_CONCURRENT_REQUESTS = 1;
const REQUEST_INTERVAL_MS = 1000;

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

class RequestLimiter {
  private activeRequests = 0;
  private lastRequestAt = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrent: number,
    private readonly intervalMs: number,
  ) {}

  async run<T>(request: () => Promise<T>): Promise<T> {
    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });

    try {
      return await request();
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) return;

    const waitMs = Math.max(0, this.intervalMs - (Date.now() - this.lastRequestAt));
    if (waitMs > 0) {
      setTimeout(() => this.processQueue(), waitMs);
      return;
    }

    const startRequest = this.queue.shift();
    if (!startRequest) return;

    this.activeRequests++;
    this.lastRequestAt = Date.now();
    startRequest();
    this.processQueue();
  }
}

const requestLimiter = new RequestLimiter(MAX_CONCURRENT_REQUESTS, REQUEST_INTERVAL_MS);

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
  const res = await requestLimiter.run(() => fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Access-Token': apiToken,
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
  }));

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
  departureAt = formatMonth(new Date()),
): Promise<void> {
  const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
  url.searchParams.set('origin', origin);
  url.searchParams.set('unique', 'true');
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('limit', String(ROUTE_RESULT_LIMIT));
  url.searchParams.set('one_way', 'true');
  if (departureAt) {
    url.searchParams.set('departure_at', departureAt);
  }
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

export async function fetchTravelpayoutsFlightOffers(apiToken: string): Promise<FlightOffer[]> {
  const offers: FlightOffer[] = [];
  const seen = new Set<string>();
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + SEARCH_WINDOW_DAYS);

  // The aggregated origin search already includes domestic, European and long-haul routes.
  // Keep one request per origin so a sync completes quickly and stays within the API quota.
  for (const origin of ITALIAN_ORIGINS) {
    await fetchCheapRoutesFromOrigin(origin, apiToken, windowEnd, seen, offers, '');
  }

  const domesticOffers: FlightOffer[] = [];
  const europeanOffers: FlightOffer[] = [];
  const extraEUOffers: FlightOffer[] = [];

  for (const offer of offers) {
    if (isDomesticFlight(offer.origin, offer.destination)) {
      domesticOffers.push(offer);
    } else if (isExtraEUFlight(offer.origin, offer.destination)) {
      extraEUOffers.push(offer);
    } else {
      europeanOffers.push(offer);
    }
  }

  // Sort each bucket by price
  domesticOffers.sort((a, b) => a.price - b.price);
  europeanOffers.sort((a, b) => a.price - b.price);
  extraEUOffers.sort((a, b) => a.price - b.price);

  // Reserve quotas so long-haul Extra-EU flights are guaranteed alongside domestic & EU
  const selectedDomestic = domesticOffers.slice(0, 60);
  const selectedEuropean = europeanOffers.slice(0, 80);
  const selectedExtraEU = extraEUOffers.slice(0, 110);

  const combined = [...selectedDomestic, ...selectedEuropean, ...selectedExtraEU];

  return combined.sort((a, b) => Number(b.is_last_minute) - Number(a.is_last_minute) || a.price - b.price);
}
