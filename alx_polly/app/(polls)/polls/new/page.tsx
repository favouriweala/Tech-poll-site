
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/app/withAuth";

function NewPollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const router = useRouter();
  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-10">
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Create New Poll</h1>
          <Button
            type="button"
            className="px-6 py-2 bg-gray-100 border border-gray-300 text-black rounded-lg font-semibold shadow hover:bg-gray-200"
            onClick={() => router.push("/polls")}
          >
            Cancel
          </Button>
        </div>
        <div className="flex w-full bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'basic' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'settings' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        {activeTab === 'basic' && (
          <Card className="max-w-2xl w-full mx-auto p-8 space-y-6 bg-white rounded-2xl border border-[#e5e7eb] shadow-md">
            <CardHeader className="text-black text-[20px] rounded-2xl pb-2">
              <CardTitle className="font-bold text-[20px]">Poll Information</CardTitle>
              <CardDescription className="text-[#6b7280] text-[15px]">Enter the details for your new poll</CardDescription>
            </CardHeader>
            <CardContent className="rounded-2xl">
              <form className="grid gap-4 text-black">
                <div className="grid gap-2">
                  <Label htmlFor="question" className="font-semibold">Poll Title</Label>
                  <Input id="question" placeholder="Enter a question or title" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="option1" className="font-semibold">Description (Optional)</Label>
                  <Input id="option1" placeholder="Provide more context about your poll" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="polloptions" className="font-semibold">Poll Options</Label>
                  <Input id="option1" placeholder="Option 1" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                  <Input id="option2" placeholder="Option 2" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                </div>
                <div className="flex justify-start">
                  <Button className="bg-[#f3f6fa] text-black border border-[#e5e7eb] rounded-lg font-semibold hover:bg-[#e5e7eb]">Add Option</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {activeTab === 'settings' && (
          <Card className="max-w-2xl w-full mx-auto p-8 space-y-6 bg-white rounded-2xl border border-[#e5e7eb] shadow-md">
            <CardHeader className="text-black text-[20px] rounded-2xl pb-2">
              <CardTitle className="font-bold text-[20px]">Poll Settings</CardTitle>
              <CardDescription className="text-[#6b7280] text-[15px]">Configure additional options for your poll</CardDescription>
            </CardHeader>
            <CardContent className="rounded-2xl">
              <div className="flex flex-col gap-3 my-4">
                <label className="flex items-center gap-2 text-black">
                  <input type="checkbox" className="h-4 w-4" />
                  Allow multiple selections
                </label>
                <label className="flex items-center gap-2 text-black">
                  <input type="checkbox" className="h-4 w-4" />
                  Make poll results public
                </label>
              </div>
              <div className="grid gap-2 text-black">
                <Label htmlFor="pollEndDate" className="font-semibold">Poll End Date (Optional)</Label>
                <Input id="pollEndDate" type="date" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex justify-end w-full max-w-2xl mt-6">
          <Button
            type="submit"
            className="px-8 py-2 text-white bg-blue-700 rounded-lg font-semibold shadow hover:bg-blue-800"
            onClick={() => alert('Poll created!')}
          >
            Create Poll
          </Button>
        </div>
      </div>
    </section>
  );
}

export default withAuth(NewPollPage);





