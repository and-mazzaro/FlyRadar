import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { getMockFlightOffers, FlightOffer } from '@/lib/mock-flights';
import { fetchTravelpayoutsFlightOffers } from '@/lib/travelpayouts-flights';
import { matchesAirportOrCity } from '@/lib/constants';
import { Resend } from 'resend';

// Initialise Resend Client using dynamic environment key check
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Disable mock flight generation fallback to see if Travelpayouts API works
const ENABLE_MOCK_FALLBACK = false;

// Helper to check if a flight's airport matches the user's alert value (code or name)
export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron authorization header protection
    const authHeader = request.headers.get('authorization');
    const isLocalFetch = authHeader === 'Bearer local-fetch';
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isLocalFetch && !isVercelCron && process.env.NODE_ENV === 'production') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch flight offers from Travelpayouts (Aviasales Data API) if token is set
    let rawOffers: FlightOffer[] = [];
    const travelpayoutsToken = process.env.TRAVELPAYOUTS_API_TOKEN;

    if (travelpayoutsToken) {
      try {
        rawOffers = await fetchTravelpayoutsFlightOffers(travelpayoutsToken);
      } catch (err) {
        console.error('Failed to fetch from Travelpayouts API, falling back to mock:', err);
      }
    }

    // Only fallback if mock generation is enabled
    if (rawOffers.length === 0 && ENABLE_MOCK_FALLBACK) {
      console.log('No offers from API, generating mock flight offers...');
      rawOffers = getMockFlightOffers();
    }

    const supabase = createSupabaseAdminClient();

    // 3. Upsert flights into database
    // Clean old flights to keep db lightweight (optional cleanup phase)
    await supabase
      .from('flights')
      .delete()
      .lt('departure_date', new Date().toISOString());

    if (rawOffers.length === 0) {
      return NextResponse.json({ success: true, message: 'No flight offers fetched from API', flightsInserted: 0 });
    }

    const { data: insertedFlights, error: insertError } = await supabase
      .from('flights')
      .insert(rawOffers)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert flights: ${insertError.message}`);
    }

    if (!insertedFlights || insertedFlights.length === 0) {
      return NextResponse.json({ success: true, message: 'No new flights inserted' });
    }

    // 4. Match flights with active focus alerts in database
    const { data: activeAlerts, error: alertsError } = await supabase
      .from('user_alerts')
      .select(`
        *,
        profiles (
          id,
          email,
          email_notifications_enabled
        )
      `)
      .eq('is_active', true);

    if (alertsError) {
      throw new Error(`Failed to fetch active alerts: ${alertsError.message}`);
    }

    const matchesFound: Array<{ alertId: string; flightId: string; email: string; flightDetails: any }> = [];

    // Match analysis loop
    for (const alert of activeAlerts) {
      const profile = alert.profiles;
      // Skip if user disabled email alerts
      if (!profile || !profile.email_notifications_enabled) continue;

      for (const flight of insertedFlights) {
        // Validation check using city-level mapping and name matching
        const matchOrigin = matchesAirportOrCity(flight.origin, alert.origin ?? '');
        const matchDestination = matchesAirportOrCity(flight.destination, alert.destination ?? '');
        const matchPrice = !alert.max_price || parseFloat(flight.price) <= parseFloat(alert.max_price);

        if (matchOrigin && matchDestination && matchPrice) {
          matchesFound.push({
            alertId: alert.id,
            flightId: flight.id,
            email: profile.email,
            flightDetails: flight,
          });
        }
      }
    }

    // 5. Anti-Spam Tracking (verify last 24 hours log entries)
    const sentEmailsCount = { count: 0 };

    for (const match of matchesFound) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if we already alerted this user for this flight deal in the past 24 hours
      const { data: existingLog } = await supabase
        .from('alert_logs')
        .select('id')
        .eq('alert_id', match.alertId)
        .eq('flight_id', match.flightId)
        .gt('sent_at', yesterday.toISOString())
        .maybeSingle();

      if (existingLog) {
        // Skip sending email
        continue;
      }

      // Send email alert via Resend SDK
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const bookingUrl = `${appUrl}/api/redirect?flight_id=${match.flightId}`;
      const unsubscribeUrl = `${appUrl}/api/unsubscribe?alert_id=${match.alertId}`;

      if (resend) {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: match.email,
            subject: `✈️ FlyDetector Alert: Volo ${match.flightDetails.origin} ➔ ${match.flightDetails.destination} a soli ${match.flightDetails.price}€!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #2563eb; margin-top: 0;">Radar Voli Match Trovato!</h2>
                <p style="color: #475569; font-size: 16px;">Il tuo radar ha intercettato una nuova tariffa super scontata per la tratta desiderata:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px;">${match.flightDetails.origin} ➔ ${match.flightDetails.destination}</h3>
                  <p style="margin: 5px 0; color: #334155;"><strong>Compagnia Aerea:</strong> ${match.flightDetails.airline}</p>
                  <p style="margin: 5px 0; color: #334155;"><strong>Data Partenza:</strong> ${new Date(match.flightDetails.departure_date).toLocaleString('it-IT')}</p>
                  ${match.flightDetails.return_date ? `<p style="margin: 5px 0; color: #334155;"><strong>Data Ritorno:</strong> ${new Date(match.flightDetails.return_date).toLocaleString('it-IT')}</p>` : ''}
                  <p style="margin: 10px 0 0 0; font-size: 24px; color: #10b981; font-weight: bold;">Prezzo: ${match.flightDetails.price}€</p>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                  <a href="${bookingUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Prenota Ora il Volo</a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                
                <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
                  Ricevi questa comunicazione a seguito dell'avviso radar configurato su FlyDetector.<br />
                  Se non desideri più ricevere avvisi per questa ricerca specifica, puoi <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: underline;">disattivare questo radar con un click</a>.
                </p>
              </div>
            `,
          });

          // Insert alert log registry to track anti-spam rate limits
          await supabase.from('alert_logs').insert({
            alert_id: match.alertId,
            flight_id: match.flightId,
          });

          sentEmailsCount.count++;
        } catch (emailErr) {
          console.error(`Email send failure for ${match.email}:`, emailErr);
        }
      } else {
        // Fallback logger for local environments where RESEND_API_KEY is not defined
        console.log(`[MOCK EMAIL SENT to ${match.email}] Volo: ${match.flightDetails.origin} -> ${match.flightDetails.destination} a ${match.flightDetails.price}€ (Booking Link: ${bookingUrl})`);
        
        await supabase.from('alert_logs').insert({
          alert_id: match.alertId,
          flight_id: match.flightId,
        });

        sentEmailsCount.count++;
      }
    }

    return NextResponse.json({
      success: true,
      flightsInserted: insertedFlights.length,
      alertsChecked: activeAlerts.length,
      notificationsSent: sentEmailsCount.count,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

