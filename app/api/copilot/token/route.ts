import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const DIRECT_LINE_URL = 'https://directline.botframework.com/v3/directline/tokens/generate';

/**
 * Returns a short-lived Direct Line token for the Copilot Studio Author Concierge.
 * The Direct Line secret is kept server-side; only the token is sent to the client.
 *
 * Human gate: COPILOT_DIRECT_LINE_SECRET must be added to Vercel env before this
 * endpoint is functional. See RUNBOOKS/copilot-studio.md.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.COPILOT_DIRECT_LINE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: 'copilot_not_configured', message: 'COPILOT_DIRECT_LINE_SECRET is not set' },
      { status: 503 }
    );
  }

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = await fetch(DIRECT_LINE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!res.ok) {
    console.error('[copilot/token] Direct Line token generation failed', res.status);
    return NextResponse.json({ error: 'token_generation_failed' }, { status: 502 });
  }

  const data = (await res.json()) as { token: string; expires_in: number };
  return NextResponse.json({ token: data.token, expiresIn: data.expires_in });
}
