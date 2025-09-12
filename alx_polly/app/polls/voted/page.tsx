"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublicPolls } from "@/lib/actions";

interface PollResult {
  id: string;
  title: string;
  description: string;
  total_votes: number;
}

interface PollResultsState {
  polls: PollResult[];
  loading: boolean;
  error: string | null;
}

export default function PollResultsPage() {
  const [state, setState] = useState<PollResultsState>({
    polls: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const polls = await getPublicPolls();
        setState({
          polls: polls || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          polls: [],
          loading: false,
          error: 'Failed to load poll results. Please try again later.'
        });
      }
    };

    fetchPolls();
  }, []);

  const { polls, loading, error } = state;

  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">Poll Results</h1>
        <p className="text-lg text-gray-700 mb-8">See the results for all polls on the platform below.</p>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading poll results...</span>
          </div>
        )}
        
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}
        
        {!loading && !error && polls.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No polls available yet.</p>
            <Link href="/polls/new" className="text-blue-600 hover:underline font-medium mt-2 inline-block">
              Create the first poll
            </Link>
          </div>
        )}
        
        {!loading && !error && polls.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-3 px-4 border-b text-blue-900 text-lg font-bold">Title</th>
                  <th className="py-3 px-4 border-b text-blue-900 text-lg font-bold">Description</th>
                  <th className="py-3 px-4 border-b text-blue-900 text-lg font-bold text-center">Votes</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id} className="hover:bg-blue-100 transition">
                    <td className="py-3 px-4 border-b font-semibold text-blue-700 text-lg">
                      <Link href={`/polls/${poll.id}`} className="hover:underline">
                        {poll.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 border-b text-black text-base">
                      {poll.description || 'No description provided'}
                    </td>
                    <td className="py-3 px-4 border-b text-green-600 text-center text-xl font-bold">
                      {poll.total_votes || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Link href="/dashboard" className="mt-8 text-blue-700 hover:underline font-semibold text-lg">&larr; Back to Dashboard</Link>
      </div>
    </section>
  );
}
