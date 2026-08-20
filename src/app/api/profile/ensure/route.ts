import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, createSupabaseAdminClient } from '@/lib/supabase';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Sessione non valida' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      country: 'Italia',
      preferred_airlines: [],
      email_notifications_enabled: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      return NextResponse.json({ error: 'Profilo non disponibile' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Impossibile preparare il profilo' }, { status: 500 });
  }
}
