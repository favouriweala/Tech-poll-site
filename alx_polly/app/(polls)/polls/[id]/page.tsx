"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollWithResults, getUserVotes, deletePoll } from "@/lib/actions";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createOptimizedVoteProcessor } from "@/lib/vote-utils";
import PollVotingForm from "./PollVotingForm";
import PollResults from "./PollResults";
import ShareButtons from "./ShareButtons";
import { useEffect, useState } from "react";

interface PollOption {
  option_id: string;
  option_text: string;
  order_index: number;
  vote_count: number;
  vote_percentage: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  created_by: string;
  end_date: string;
  is_active: boolean;
  is_public: boolean;
  allow_multiple_selections: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface User {
  id: string;
}

interface UserVote {
  option_id: string;
}

function RealtimePollUpdater({ pollId, onUpdate }: { pollId: string, onUpdate: (data: Poll) => void }) {
  useEffect(() => {
    const eventSource = new EventSource(`/api/polls/${pollId}/updates`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [pollId, onUpdate]);

  return null;
}

function PollDetailPageContent({ initialPoll, user, userVotes: initialUserVotes }: { initialPoll: Poll, user: User | null, userVotes: UserVote[] }) {
  const [poll, setPoll] = useState(initialPoll);
  const [userVotes] = useState(initialUserVotes);

  const handlePollUpdate = (updatedPoll: Poll) => {
    setPoll(updatedPoll);
  };

  const id = poll.id;
  const hasVoted = userVotes.length > 0;
  const isCreator = user?.id === poll.created_by;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const isPollEnded = poll.end_date && new Date(poll.end_date) <= new Date();
  const isActive = poll.is_active && !isPollEnded;

  const voteProcessor = createOptimizedVoteProcessor(poll.options);
  const { totalVotes, uniqueVoters } = voteProcessor.getStats();

  return (
    <>
      <RealtimePollUpdater pollId={id} onUpdate={handlePollUpdate} />
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto max-w-[1200px] px-4">
          {/* Back to Polls link and Edit/Delete buttons */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/polls" className="text-blue-600 hover:underline text-lg font-bold">
              ← Back to Polls
            </Link>
            {isCreator && (
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-gray-300 text-lg font-bold">
                  Edit Poll
                </Button>
                <form action={async () => {
                  'use server';
                  await deletePoll(id);
                }}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="bg-white text-red-600 hover:bg-red-50 border-gray-300 text-lg font-bold"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Poll status indicators */}
          <div className="mb-4 flex gap-2">
            {!isActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {isPollEnded ? 'Poll Ended' : 'Inactive'}
              </span>
            )}
            {!poll.is_public && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Private Poll
              </span>
            )}
          </div>

          {/* Main poll card */}
          <Card className="w-full bg-white border border-gray-300 shadow-2xl max-w-[1100px] mx-auto">
            <CardHeader className="text-left px-8 py-6">
              <CardTitle className="text-3xl font-bold text-black">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="text-xl text-black mt-3 font-normal">
                  {poll.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Show voting form or results */}
              {isActive && !hasVoted ? (
                <PollVotingForm
                  poll={poll}
                  userId={user?.id}
                  allowMultiple={poll.allow_multiple_selections}
                />
              ) : (
                <PollResults
                  poll={poll}
                  userVotes={userVotes}
                  showVotes={hasVoted || !isActive || !user}
                />
              )}

              {/* Poll statistics */}
              <div className="mt-8 pt-6 border-t border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalVotes}
                    </div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {poll.options.length}
                    </div>
                    <div className="text-sm text-gray-600">Options</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {uniqueVoters}
                    </div>
                    <div className="text-sm text-gray-600">Unique Voters</div>
                  </div>
                </div>

                {/* Creator and date info */}
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <div className="text-lg text-black font-normal">
                      Created by {poll.profiles?.full_name || poll.profiles?.email || 'Anonymous'}
                    </div>
                  </div>
                  <div className="text-lg text-black text-right font-normal">
                    Created on {formatDate(poll.created_at)}
                    {poll.end_date && (
                      <div className="text-sm text-gray-600">
                        Ends on {formatDate(poll.end_date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share section */}
          <ShareButtons pollTitle={poll.title} />
        </div>
      </div>
    </>
  );
}

function PollDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const pollData = await getPollWithResults(id);
      if (!pollData) {
        notFound();
        return;
      }
      setPoll(pollData);

      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const userVotesData = await getUserVotes(id, user.id);
        setUserVotes(userVotesData);
      }
    };

    fetchData();
  }, [id]);

  if (!poll) {
    return <div>Loading...</div>;
  }

  return <PollDetailPageContent initialPoll={poll} user={user} userVotes={userVotes} />;
}

export default PollDetailPage;
