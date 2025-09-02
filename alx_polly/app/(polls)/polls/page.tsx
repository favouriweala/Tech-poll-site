import Link from "next/link";
import { Button } from "@/components/ui/button";
import withAuth from "@/app/withAuth";
import { getPublicPolls } from "@/lib/actions";
import SuccessMessage from "./SuccessMessage";

async function PollsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ success?: string }> 
}) {
  const polls = await getPublicPolls();
  const resolvedSearchParams = await searchParams;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h1 className="text-4xl font-extrabold text-black tracking-tight">All Polls</h1>
          <Link href="/polls/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow">
              Create New Poll
            </Button>
          </Link>
        </div>

        {resolvedSearchParams.success && <SuccessMessage />}

        {polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">No polls yet</h3>
              <p className="text-gray-500 mb-6">Be the first to create a poll and start gathering opinions!</p>
              <Link href="/polls/new">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-2">
                  Create Your First Poll
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-center">
            {polls.map((poll) => (
              <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100 shadow-sm p-10 flex flex-col gap-2 w-full max-w-[1500px] h-[260px] mx-auto transition hover:shadow-2xl hover:scale-[1.03] overflow-hidden">
                  <div className="pb-4">
                    <div className="text-2xl font-bold leading-tight text-blue-800 mb-2 break-words whitespace-normal">
                      {poll.title}
                    </div>
                    <div className="text-[16px] leading-relaxed mt-1 text-gray-700 break-words">
                      {poll.description || "No description provided"}
                    </div>
                  </div>
                  <div className="grid gap-2 text-[15px] text-black font-medium">
                    <span className="text-blue-700 font-semibold">
                      {poll.option_count} {poll.option_count === 1 ? 'choice' : 'choices'}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className="text-purple-600 font-semibold">
                      {poll.unique_voters} {poll.unique_voters === 1 ? 'voter' : 'voters'}
                    </span>
                    <span className="mt-2 text-[14px] font-normal text-gray-500">
                      Created {formatDate(poll.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PollsPage;
