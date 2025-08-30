"use client";

import { useAuth } from "../(auth)/context/authContext";
import { Button } from "@/components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useEffect, useState } from "react";


export default function Dashboard() {
  const { user } = useAuth();
  const [activePolls, setActivePolls] = useState(0);
  const [pollsVoted, setPollsVoted] = useState(0);

  useEffect(() => {
    // Simulate fetching poll data from the polls page
    // Replace this with a real API call if you have one
    const samplePolls = [
      { id: "1", title: "Favourite Programming Language", votes: 452 },
      { id: "2the", title: "Best Frontend Framework", votes: 368 },
      { id: "3", title: "Preferred Database", votes: 279 },
    ];
    setActivePolls(samplePolls.length);
    // Show total votes for all polls
    const totalVotes = samplePolls.reduce((sum, poll) => sum + poll.votes, 0);
    setPollsVoted(totalVotes);
  }, []);

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f7fafd] py-12 px-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        {user ? (
          <>
            <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">Welcome back, {user?.email?.split("@")?.[0] ?? "User"}! 👋</h1>
            <p className="text-lg text-gray-700 mb-6">Ready to create your next poll or see your results? Let’s dive in.</p>
            <div className="flex flex-col md:flex-row gap-6 w-full mb-8">
              <a href="/polls" className="flex-1">
                <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl shadow hover:shadow-xl transition cursor-pointer flex flex-col items-center border-2 border-blue-100 hover:scale-[1.03]">
                  <p className="text-white text-lg font-semibold mb-2">📊 All active polls</p>
                  <p className="text-3xl font-bold text-white">{activePolls}</p>
                </div>
              </a>
              <a href="/polls/voted" className="flex-1">
                <div className="p-8 bg-gradient-to-br from-green-500 to-green-400 rounded-xl shadow hover:shadow-xl transition cursor-pointer flex flex-col items-center border-2 border-green-100 hover:scale-[1.03]">
                  <p className="text-white text-lg font-semibold mb-2">✅ Poll results</p>
                  <p className="text-3xl font-bold text-white">{pollsVoted}</p>
                </div>
              </a>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
              <a href="/polls/new" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow">Create New Poll</Button>
              </a>
              <a href="/polls" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow">Go to My Polls</Button>
              </a>
            </div>
          </>
        ) : (
          <p className="text-red-500 text-center mt-10 text-lg font-semibold">
            No user found. Please log in to access your dashboard.
          </p>
        )}
      </div>
    </section>
  );
}

