import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Poll data based on ID
  const getPollData = (pollId: string) => {
    switch (pollId) {
      case "1":
        return {
          title: "Favourite Programming Language",
          description: "What programming language do you prefer to use?",
          options: [
            { id: "javascript", label: "JavaScript" },
            { id: "python", label: "Python" },
            { id: "java", label: "Java" },
            { id: "csharp", label: "C#" },
            { id: "go", label: "Go" },
          ],
          creator: "Nkeiruka Iweala",
          createdDate: new Date().toLocaleDateString('en-GB')
        };
      case "2":
        return {
          title: "Best Frontend Framework",
          description: "Which frontend framework do you think is the best?",
          options: [
            { id: "react", label: "React" },
            { id: "vue", label: "Vue.js" },
            { id: "angular", label: "Angular" },
            { id: "svelte", label: "Svelte" },
            { id: "nextjs", label: "Next.js" },
          ],
          creator: "Nkeiruka Iweala",
          createdDate: new Date().toLocaleDateString('en-GB')
        };
      case "3":
        return {
          title: "Preferred Database",
          description: "Which database do you prefer to use and why?",
          options: [
            { id: "postgresql", label: "PostgreSQL" },
            { id: "mysql", label: "MySQL" },
            { id: "mongodb", label: "MongoDB" },
            { id: "sqlite", label: "SQLite" },
            { id: "redis", label: "Redis" },
          ],
          creator: "Nkeiruka Iweala",
          createdDate: new Date().toLocaleDateString('en-GB')
        };
      default:
        return {
          title: "Sample Poll",
          description: "This is a sample poll question.",
          options: [
            { id: "option1", label: "Option 1" },
            { id: "option2", label: "Option 2" },
          ],
          creator: "Nkeiruka Iweala",
          createdDate: new Date().toLocaleDateString('en-GB')
        };
    }
  };

  const pollData = getPollData(id);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back to Polls link and Edit/Delete buttons on same line */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/polls" className="text-blue-600 hover:underline text-lg font-bold">
            ← Back to Polls
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-gray-300 text-lg font-bold">Edit Poll</Button>
            <Button variant="outline" className="bg-white text-red-600 hover:bg-gray-100 border-gray-300 text-lg font-bold">Delete</Button>
          </div>
        </div>

        {/* Main poll card */}
        <Card className="w-full bg-white border border-gray-300 shadow-2xl">
          <CardHeader className="text-left px-8 py-6">
            <CardTitle className="text-3xl font-bold text-black">{pollData.title}</CardTitle>
            <CardDescription className="text-xl text-black mt-3 font-normal">{pollData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Poll options */}
            <div className="space-y-4">
              {pollData.options.map((opt) => (
                <div key={opt.id} className="flex items-center p-6 border border-gray-300 rounded-lg bg-white">
                  <span className="font-bold text-xl text-black">{opt.label}</span>
                </div>
              ))}
            </div>

            {/* Creator and date info */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <Button className="bg-black text-white hover:bg-gray-800 mb-4 w-32 text-lg font-bold">Submit Vote</Button>
                  <div className="text-lg text-black font-normal">Created by {pollData.creator}</div>
                </div>
                <div className="text-lg text-black text-right font-normal">Created on {pollData.createdDate}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share section - moved below the main card */}
        <div className="mt-16 pt-10">
          <h3 className="text-2xl font-bold mb-8 text-black">Share this poll</h3>
          <div className="flex justify-center">
            <div className="flex justify-between w-full gap-6">
              <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-gray-300 flex-1 text-lg py-3 font-bold">Copy Link</Button>
              <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-gray-300 flex-1 text-lg py-3 font-bold">Share on Twitter</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





