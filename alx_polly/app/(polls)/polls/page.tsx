import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PollsPage() {
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
      createdAt: new Date(2024, 11, 28),
    },
  ];

  return (
    <div className="grid gap-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">My Polls</h1>
        <Link href="/polls/new">
          <Button className="bg-black text-white hover:bg-gray-800">Create New Poll</Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {samplePolls.map((poll) => {
          const date = poll.createdAt instanceof Date
            ? `${String(poll.createdAt.getDate()).padStart(2, "0")}/${String(poll.createdAt.getMonth() + 1).padStart(2, "0")}/${poll.createdAt.getFullYear()}`
            : poll.createdAt;

          return (
            <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
              <Card className="flex flex-col justify-between transition hover:shadow-md bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px] font-semibold leading-tight text-black">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="text-[12px] leading-relaxed mt-2 text-black">
                    {poll.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1 text-[12px] text-black">
                    <span>{poll.choices} choices</span>
                    <span>{poll.votes} total votes</span>
                    <span className="mt-2">Created {date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <Button className="w-[220px] bg-black text-white hover:bg-gray-800">Submit Vote</Button>
    </div>
  );
}