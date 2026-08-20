import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { acceptStaffInvite } from '@/actions/staff';

export default async function InvitePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  
  if (!token) {
    redirect('/');
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    // Fixed: Avoided template literal issue by using string concatenation
    redirect('/signin?callbackUrl=/invite?token=' + token);
  }

  try {
    const result = await acceptStaffInvite(token);
    if (result.success) {
      redirect('/portal');
    }
  } catch (error) {
    console.error("Failed to accept invite", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <h1 className="text-2xl font-bold font-heading mb-2">Invalid or Expired Invite</h1>
        <p className="text-muted-foreground text-center">
          The invite link you followed is no longer valid. It may have already been accepted or the token is incorrect.
        </p>
      </div>
    );
  }
}
