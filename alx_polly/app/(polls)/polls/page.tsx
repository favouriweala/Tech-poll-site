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
  <div className="grid gap-6 bg-transparent mt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">My Polls</h1>
        <Link href="/polls/new">
          <Button className="bg-black text-white hover:bg-gray-800">Create New Poll</Button>
        </Link>
      </div>

  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {samplePolls.map((poll) => {
          const date = poll.createdAt instanceof Date
            ? `${String(poll.createdAt.getDate()).padStart(2, "0")}/${String(poll.createdAt.getMonth() + 1).padStart(2, "0")}/${poll.createdAt.getFullYear()}`
            : poll.createdAt;

          return (
            <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
              <Card className="flex flex-col justify-between transition hover:shadow-lg min-h-[300px] min-w-[380px] max-w-[500px] w-full h-[300px] p-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-[22px] font-bold leading-tight text-black">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="text-[16px] leading-relaxed mt-3 text-black">
                    {poll.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-[15px] text-black font-medium">
                    <span>{poll.choices} choices</span>
                    <span>{poll.votes} total votes</span>
                    <span className="mt-2 text-[14px] font-normal">Created {date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default withAuth(PollsPage);
