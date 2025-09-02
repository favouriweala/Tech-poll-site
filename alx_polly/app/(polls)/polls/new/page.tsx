
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/app/withAuth";
import { createPoll } from "@/lib/actions";


function NewPollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (formData: FormData) => {
    setError('');
    
    // Validate client-side before submission
    const validOptions = options.filter(option => option.trim().length > 0);
    
    if (!title.trim()) {
      setError('Poll title is required');
      return;
    }
    
    if (validOptions.length < 2) {
      setError('At least 2 poll options are required');
      return;
    }
    
    // Add title and description to form data
    formData.set('title', title.trim());
    formData.set('description', description.trim());
    
    // Add options to form data
    validOptions.forEach((option, index) => {
      formData.append(`option-${index}`, option.trim());
    });

    startTransition(async () => {
      try {
        await createPoll(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while creating the poll');
      }
    });
  };

  const isBasicTabValid = () => {
    const validOptions = options.filter(option => option.trim().length > 0);
    return title.trim().length > 0 && validOptions.length >= 2;
  };

  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-10">
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Create New Poll</h1>
          <Button
            type="button"
            className="px-6 py-2 bg-gray-100 border border-gray-300 text-black rounded-lg font-semibold shadow hover:bg-gray-200"
            onClick={() => router.push("/polls")}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>

        {error && (
          <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="w-full max-w-2xl">
          <div className="flex w-full bg-blue-50 rounded-xl border border-blue-100 mb-6">
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'basic' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
              onClick={() => setActiveTab('basic')}
              disabled={isPending}
            >
              Basic Info
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'settings' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
              onClick={() => setActiveTab('settings')}
              disabled={isPending}
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
                <div className="grid gap-4 text-black">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="font-semibold">Poll Title *</Label>
                    <Input 
                      id="title" 
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a question or title" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more context about your poll" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]"
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Poll Options *</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder={`Option ${index + 1}`} 
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]"
                          disabled={isPending}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                            disabled={isPending}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-start">
                      <Button 
                        type="button"
                        onClick={addOption}
                        disabled={options.length >= 10 || isPending}
                        className="bg-[#f3f6fa] text-black border border-[#e5e7eb] rounded-lg font-semibold hover:bg-[#e5e7eb]"
                      >
                        Add Option
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">At least 2 options required. Maximum 10 options.</p>
                  </div>
                </div>
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
                    <input 
                      type="checkbox" 
                      name="allowMultipleSelections"
                      className="h-4 w-4" 
                      disabled={isPending}
                    />
                    Allow multiple selections
                  </label>
                  <label className="flex items-center gap-2 text-black">
                    <input 
                      type="checkbox" 
                      name="isPublic"
                      className="h-4 w-4" 
                      defaultChecked
                      disabled={isPending}
                    />
                    Make poll results public
                  </label>
                </div>
                <div className="grid gap-2 text-black">
                  <Label htmlFor="endDate" className="font-semibold">Poll End Date (Optional)</Label>
                  <Input 
                    id="endDate" 
                    name="endDate"
                    type="date" 
                    className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]"
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between w-full mt-6">
            <div className="flex gap-2">
              {activeTab === 'settings' && (
                <Button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-6 py-2 bg-gray-100 border border-gray-300 text-black rounded-lg font-semibold shadow hover:bg-gray-200"
                  disabled={isPending}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab === 'basic' ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-8 py-2 text-white bg-blue-700 rounded-lg font-semibold shadow hover:bg-blue-800"
                  disabled={!isBasicTabValid() || isPending}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="px-8 py-2 text-white bg-blue-700 rounded-lg font-semibold shadow hover:bg-blue-800"
                  disabled={isPending}
                >
                  {isPending ? 'Creating Poll...' : 'Create Poll'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default withAuth(NewPollPage);





