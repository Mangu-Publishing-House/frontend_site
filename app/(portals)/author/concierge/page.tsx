import { redirect } from 'next/navigation';
import { getRequestUser } from '@/lib/api/request-user';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { AuthorConcierge } from './AuthorConcierge';

export const metadata = {
  title: 'Author Concierge',
  description: 'AI-powered assistant for your manuscripts and royalties',
};

export default async function AuthorConciergePage() {
  const user = await getRequestUser();
  if (!user) redirect('/login');
  if (user.role !== 'author' && user.role !== 'admin') redirect('/');

  return (
    <Section>
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Author Concierge</h1>
          <p className="mt-1 text-muted-foreground">
            Ask about your manuscripts, royalties, submission requirements, or the EQS rubric.
          </p>
        </div>
        <AuthorConcierge />
      </Container>
    </Section>
  );
}
