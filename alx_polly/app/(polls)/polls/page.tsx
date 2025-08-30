'use client'

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import withAuth from "@/app/withAuth";


function PollsPage() {
  const samplePolls = [
    {
      id: "1",
      title: "Favourite Programming Language",
      description: "Which programming language do you prefer to use?",
      choices: 6,
      votes: 452,
      createdAt: new Date(2025, 0, 14),
    },
    {
      id: "2",
      title: "Best Frontend Framework",
      description: "Which frontend framework do you think is the best?",
      choices: 5,
      votes: 368,
      createdAt: new Date(2025, 0, 10),
    },
    {
      id: "3",
      title: "Preferred Database",
      description: "Which database do you prefer to use and why?",
      choices: 5,
      votes: 279,
      createdAt: new Date(2025, 11, 28),
    },
  ];

  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h1 className="text-4xl font-extrabold text-black tracking-tight">All Polls</h1>
          <Link href="/polls/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-lg shadow">Create New Poll</Button>
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-center">
          {samplePolls.map((poll) => {
            const date = poll.createdAt instanceof Date
              ? `${String(poll.createdAt.getMonth() + 1).padStart(2, "0")}/${String(poll.createdAt.getDate()).padStart(2, "0")}/${poll.createdAt.getFullYear()}`
              : poll.createdAt;

            return (
              <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100 shadow-sm p-10 flex flex-col gap-2 w-full max-w-[1500px] h-[260px] mx-auto transition hover:shadow-2xl hover:scale-[1.03] overflow-hidden">
                  <div className="pb-4">
                    <div className="text-2xl font-bold leading-tight text-blue-800 mb-2 break-words whitespace-normal">
                      {poll.title}
                    </div>
                    <div className="text-[16px] leading-relaxed mt-1 text-gray-700 break-words">
                      {poll.description}
                    </div>
                  </div>
                  <div className="grid gap-2 text-[15px] text-black font-medium">
                    <span className="text-blue-700 font-semibold">{poll.choices} choices</span>
                    <span className="text-green-600 font-semibold">{poll.votes} total votes</span>
                    <span className="mt-2 text-[14px] font-normal text-gray-500">Created {date}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default withAuth(PollsPage);
