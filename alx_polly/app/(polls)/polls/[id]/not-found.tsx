import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white py-8 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Poll Not Found</h2>
          <p className="text-gray-600 mb-8">
            The poll you're looking for doesn't exist or may have been deleted.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/polls">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3">
              Browse All Polls
            </Button>
          </Link>
          
          <div className="text-center">
            <Link href="/polls/new" className="text-blue-600 hover:underline font-medium">
              Create a new poll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
