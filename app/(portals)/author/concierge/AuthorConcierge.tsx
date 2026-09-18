'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TokenResponse {
  token: string;
  expiresIn: number;
}

export function AuthorConcierge() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/copilot/token', { method: 'POST' });
        if (res.status === 503) {
          setError('not_configured');
          return;
        }
        if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
        const data: TokenResponse = await res.json();
        setToken(data.token);
      } catch {
        setError('failed');
      } finally {
        setLoading(false);
      }
    }
    void fetchToken();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Loading concierge…</p>
        </CardContent>
      </Card>
    );
  }

  if (error === 'not_configured') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Author Concierge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            The Author Concierge is not yet provisioned. Once your administrator sets up the Copilot
            Studio bot, it will appear here automatically.
          </p>
          <p className="text-sm text-muted-foreground">
            See <code className="rounded bg-muted px-1">RUNBOOKS/copilot-studio.md</code> for setup
            instructions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-12">
          <p className="text-muted-foreground">Failed to load the concierge. Please try again.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <iframe
        title="Author Concierge"
        src={`https://webchat.botframework.com/embed/mangu-author-concierge?t=${token}`}
        className="h-[600px] w-full border-0"
        allow="microphone"
      />
    </Card>
  );
}
