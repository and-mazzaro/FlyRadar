import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flight_id');

    if (!flightId) {
      return new NextResponse('Missing flight_id parameter', { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Fetch target flight URL details from database
    const { data: flight, error } = await supabase
      .from('flights')
      .select('booking_url')
      .eq('id', flightId)
      .single();

    if (error || !flight) {
      return new NextResponse('Flight not found or expired', { status: 404 });
    }

    const targetUrl = flight.booking_url;

    // 2. Validate URL structure to prevent malicious Open Redirects
    try {
      const parsedUrl = new URL(targetUrl);
      const allowedDomains = [
        'google.com',
        'www.google.com',
        'aviasales.com',
        'www.aviasales.com',
        'aviasales.it',
        'www.aviasales.it',
        'ryanair.com',
        'easyjet.com',
        'wizzair.com',
        'vueling.com',
        'skyscanner.it',
        'skyscanner.com',
      ];

      const domain = parsedUrl.hostname.toLowerCase();
      const isAllowed = allowedDomains.some((d) => domain === d || domain.endsWith('.' + d));

      if (!isAllowed) {
        return new NextResponse('Unsafe Redirect target rejected', { status: 403 });
      }
    } catch {
      return new NextResponse('Invalid booking URL formatting', { status: 400 });
    }

    // 3. Analytics Tracking registry log (e.g. standard click counting in server database, etc.)
    console.log(`[ANALYTICS] Flight redirect tracked for ID: ${flightId} -> Target: ${targetUrl}`);

    // 4. Temporary redirect response
    return NextResponse.redirect(targetUrl, 307);
  } catch (err: unknown) {
    return new NextResponse(err instanceof Error ? err.message : 'Unexpected server error', { status: 500 });
  }
}
