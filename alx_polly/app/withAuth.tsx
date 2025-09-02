'use client'

import { useAuth } from '@/app/(auth)/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const { session, user, loading } = useAuth();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      // Only redirect if we've confirmed the user is not logged in
      if (!loading) {
        if (!session) {
          console.log("No session found, redirecting to login");
          router.replace('/login');
        } else {
          console.log("Session found:", session.user.email);
          setAuthChecked(true);
        }
      }
    }, [session, loading, router]);

    // Show loading state while checking auth
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>;
    }

    // Don't render anything until we've confirmed auth status
    if (!authChecked && !session) {
      return null;
    }

    // If we have a session, render the component
    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
