"use client";

import Link from "next/link";

const samplePolls = [
  {
    id: "1",
    title: "Favourite Programming Language",
    votes: 452,
    description: "Which programming language do you prefer to use?",
  },
  {
    id: "2",
    title: "Best Frontend Framework",
    votes: 368,
    description: "Which frontend framework do you think is the best?",
  },
  {
    id: "3",
    title: "Preferred Database",
    votes: 279,
    description: "Which database do you prefer to use and why?",
  },
];

export default function PollResultsPage() {
  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">Poll Results</h1>
        <p className="text-lg text-gray-700 mb-8">See the results for all polls on the platform below.</p>
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
              {samplePolls.map((poll) => (
                <tr key={poll.id} className="hover:bg-blue-100 transition">
                  <td className="py-3 px-4 border-b font-semibold text-blue-700 text-lg">{poll.title}</td>
                  <td className="py-3 px-4 border-b text-black text-base">{poll.description}</td>
                  <td className="py-3 px-4 border-b text-green-600 text-center text-xl font-bold">{poll.votes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/dashboard" className="mt-8 text-blue-700 hover:underline font-semibold text-lg">&larr; Back to Dashboard</Link>
      </div>
    </section>
  );
}
