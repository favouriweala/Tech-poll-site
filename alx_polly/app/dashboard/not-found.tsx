import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7fafd] py-8 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">🔒</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">
            You need to be logged in to access your dashboard.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3">
              Sign In
            </Button>
          </Link>
          
          <div className="text-center">
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
