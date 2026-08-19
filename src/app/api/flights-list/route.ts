import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: flightsData, error } = await supabase
      .from('flights')
      .select('*')
      .order('found_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flightsData || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
