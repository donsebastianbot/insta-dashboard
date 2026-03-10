import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!code) return NextResponse.redirect(new URL('/?tt=missing_code', request.url));
  if (!clientKey || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/?tt=missing_env', request.url));
  }

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) return NextResponse.redirect(new URL('/?tt=token_error', request.url));
    const tokenJson = await tokenRes.json();

    const accessToken = tokenJson.access_token as string;
    const openId = String(tokenJson.open_id || tokenJson.openid || 'unknown');

    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) return NextResponse.redirect(new URL('/?tt=profile_error', request.url));

    const userJson = await userRes.json();
    const user = userJson.data?.user || {};
    const username = user.username || user.display_name || `tiktok_${openId.slice(0, 6)}`;

    const account = await prisma.account.upsert({
      where: { handle: `@${username}` },
      update: { name: username, platform: 'TIKTOK', active: true },
      create: {
        name: username,
        handle: `@${username}`,
        platform: 'TIKTOK',
        defaultProvider: 'OPENAI',
        defaultPrompt: 'Visual vertical estilo TikTok, dinámico y llamativo',
        active: true,
      },
    });

    await prisma.socialConnection.upsert({
      where: { externalUserId: openId },
      update: {
        accountId: account.id,
        platform: 'TIKTOK',
        username,
        accessToken,
        tokenType: 'bearer',
      },
      create: {
        accountId: account.id,
        platform: 'TIKTOK',
        externalUserId: openId,
        username,
        accessToken,
        tokenType: 'bearer',
      },
    });

    return NextResponse.redirect(new URL('/?tt=connected', request.url));
  } catch {
    return NextResponse.redirect(new URL('/?tt=unexpected_error', request.url));
  }
}
