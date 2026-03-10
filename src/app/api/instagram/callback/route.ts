import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const clientId = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!code) return NextResponse.redirect(new URL('/?ig=missing_code', request.url));
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/?ig=missing_env', request.url));
  }

  try {
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/?ig=token_error', request.url));
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;

    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL('/?ig=profile_error', request.url));
    }

    const profile = await profileRes.json();
    const username = profile.username as string;
    const igUserId = String(profile.id);

    const account = await prisma.account.upsert({
      where: { handle: `@${username}` },
      update: { name: username, platform: 'INSTAGRAM', active: true },
      create: {
        name: username,
        handle: `@${username}`,
        platform: 'INSTAGRAM',
        defaultProvider: 'OPENAI',
        defaultPrompt: 'Imagen editorial de Instagram con estética premium',
        active: true,
      },
    });

    await prisma.socialConnection.upsert({
      where: { externalUserId: igUserId },
      update: {
        accountId: account.id,
        platform: 'INSTAGRAM',
        username,
        accessToken,
        tokenType: 'bearer',
      },
      create: {
        accountId: account.id,
        platform: 'INSTAGRAM',
        externalUserId: igUserId,
        username,
        accessToken,
        tokenType: 'bearer',
      },
    });

    return NextResponse.redirect(new URL('/?ig=connected', request.url));
  } catch {
    return NextResponse.redirect(new URL('/?ig=unexpected_error', request.url));
  }
}
