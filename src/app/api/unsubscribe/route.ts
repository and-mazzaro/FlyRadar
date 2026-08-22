import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

// GET triggers unsubscribe from standard link click in email footers (instant action)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alert_id');

    if (!alertId) {
      return new NextResponse('Missing alert_id parameter', { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Delete user alert rule
    const { error } = await supabase
      .from('user_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }

    // 2. Return user-friendly HTML confirmation screen
    return new NextResponse(`
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Radar Disattivato - FlyDetector</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #020617;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .card {
              background-color: #0f172a;
              border: 1px solid #1e293b;
              padding: 30px;
              border-radius: 16px;
              max-width: 400px;
              width: 100%;
              text-align: center;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            }
            h1 {
              color: #38bdf8;
              font-size: 24px;
              margin-bottom: 12px;
            }
            p {
              color: #94a3b8;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .btn {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 14px;
              transition: background-color 0.2s;
            }
            .btn:hover {
              background-color: #1d4ed8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Radar Disattivato</h1>
            <p>Il radar associato a questa ricerca e le relative notifiche email sono stati rimossi con successo dal nostro sistema.</p>
            <a href="/auth/login" class="btn">Accedi a FlyDetector</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (err: unknown) {
    return new NextResponse(err instanceof Error ? err.message : 'Unexpected server error', { status: 500 });
  }
}

// POST triggers account deletion cleanup (Right to be forgotten request)
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Delete profiles cascading metadata removes alerts, profiles logs
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Auth deletion (admin bypass client constraint restriction)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unexpected server error' }, { status: 500 });
  }
}
