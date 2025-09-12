'use client'

import { useAuth } from '@/app/(auth)/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/ui/loading-spinner';
import type { WithAuthProps } from '@/lib/auth-types';

// Higher-order component that ensures user authentication
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAuthProps>
) => {
  const WithAuthComponent = (props: P) => {
    const { session, user, loading } = useAuth();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      // Only redirect if we've confirmed the user is not logged in
      if (!loading) {
        if (!session) {
          router.replace('/login');
        } else {
          setAuthChecked(true);
        }
      }
    }, [session, loading, router]);

    // Show loading state while checking auth
    if (loading) {
      return <PageLoading text="Authenticating..." />;
    }

    // Don't render anything until we've confirmed auth status
    if (!authChecked && !session) {
      return null;
    }

    // If we have a session, render the component with auth props
    if (session && user) {
      return <WrappedComponent {...props} user={user} session={session} />;
    }
    
    // Fallback - should not reach here due to auth checks above
    return null;
  };

  return WithAuthComponent;
};

export default withAuth;
