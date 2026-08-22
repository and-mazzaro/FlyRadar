import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { error: cleanupError } = await supabase
      .from('flights')
      .delete()
      .lt('departure_date', new Date().toISOString());

    if (cleanupError) {
      return NextResponse.json({ error: cleanupError.message }, { status: 500 });
    }

    const { data: flightsData, error } = await supabase
      .from('flights')
      .select('*')
      .order('found_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flightsData || [], {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unexpected server error' }, { status: 500 });
  }
}
