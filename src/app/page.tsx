import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/feed');
  } else {
    redirect('/auth/login');
  }
}

