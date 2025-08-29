'use client'

import { useAuth } from '@/app/(auth)/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const { session, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !session) {
        router.replace('/login');
      }
    }, [session, loading, router]);

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!session) {
      return null; // Or a redirect component
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
