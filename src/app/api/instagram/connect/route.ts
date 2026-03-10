import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Faltan INSTAGRAM_APP_ID o INSTAGRAM_REDIRECT_URI en .env' },
      { status: 500 }
    );
  }

  const scope = 'instagram_business_basic,instagram_business_content_publish';
  const state = 'instapilot_connect';

  const authUrl = new URL('https://www.instagram.com/oauth/authorize');
  authUrl.searchParams.set('enable_fb_login', '0');
  authUrl.searchParams.set('force_authentication', '1');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
