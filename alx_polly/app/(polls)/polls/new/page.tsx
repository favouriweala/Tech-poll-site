
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/app/withAuth";
import { createPoll } from "@/lib/actions";
import { Textarea } from "@/components/ui/textarea";

function NewPollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Keep at least 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Input sanitization helper
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>"'&]/g, (match) => {
        const htmlEntities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return htmlEntities[match] || match;
      })
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate and sanitize form inputs
      const rawTitle = formData.get('title') as string;
      const rawDescription = formData.get('description') as string;
      
      if (!rawTitle || rawTitle.trim() === '') {
        setError('Poll title is required');
        setIsSubmitting(false);
        return;
      }
      
      const title = sanitizeInput(rawTitle);
      const description = rawDescription ? sanitizeInput(rawDescription) : '';
      
      // Validate title length
      if (title.length < 3) {
        setError('Poll title must be at least 3 characters long');
        setIsSubmitting(false);
        return;
      }
      
      if (title.length > 200) {
        setError('Poll title must be less than 200 characters');
        setIsSubmitting(false);
        return;
      }
      
      // Validate description length
      if (description && description.length > 1000) {
        setError('Poll description must be less than 1000 characters');
        setIsSubmitting(false);
        return;
      }

      // Validate and sanitize options
      const sanitizedOptions = options
        .map(opt => sanitizeInput(opt))
        .filter(opt => opt !== '');
        
      if (sanitizedOptions.length < 2) {
        setError('At least 2 poll options are required');
        setIsSubmitting(false);
        return;
      }
      
      if (sanitizedOptions.length > 10) {
        setError('Maximum 10 poll options allowed');
        setIsSubmitting(false);
        return;
      }
      
      // Validate option lengths
      for (let i = 0; i < sanitizedOptions.length; i++) {
        if (sanitizedOptions[i].length < 1) {
          setError(`Option ${i + 1} cannot be empty`);
          setIsSubmitting(false);
          return;
        }
        if (sanitizedOptions[i].length > 100) {
          setError(`Option ${i + 1} must be less than 100 characters`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(sanitizedOptions.map(opt => opt.toLowerCase()));
      if (uniqueOptions.size !== sanitizedOptions.length) {
        setError('Poll options must be unique');
        setIsSubmitting(false);
        return;
      }

      // Create new form data with sanitized inputs
      const sanitizedFormData = new FormData();
      
      // Add sanitized title and description
      sanitizedFormData.append('title', title);
      if (description) {
        sanitizedFormData.append('description', description);
      }
      
      // Add other form fields (excluding title, description, and options)
      for (const [key, value] of formData.entries()) {
        if (!key.startsWith('option-') && key !== 'title' && key !== 'description') {
          sanitizedFormData.append(key, value);
        }
      }
      
      // Add sanitized options to form data
      sanitizedOptions.forEach((option, index) => {
        sanitizedFormData.append(`option-${index}`, option);
      });
      
      // Form data prepared for submission

      // Wrap the server action call in another try/catch to handle any potential errors
      try {
        // Call the server action with sanitized data - this will redirect on success
        const result = await createPoll(sanitizedFormData);
        
        // Handle the ServerActionResponse
        if (result.success) {
          // Success - redirect will happen automatically from server action
          return;
        } else {
          // Error returned from server action
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
      } catch (actionErr: unknown) {
        // This is likely a redirect, which is good!
        if (actionErr instanceof Error && actionErr.message === 'NEXT_REDIRECT') {
          return; // Let the redirect happen naturally
        }
        
        // Only set error for non-redirect errors
        throw actionErr; // Re-throw to be caught by outer catch
      }
    } catch (err: unknown) {
      // Don't show error for redirect
      if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
        return; // Let the redirect happen naturally
      }
      
      // For all other errors
      setError('Failed to create poll. Please try again.');
      setIsSubmitting(false);
    }
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
          >
            Cancel
          </Button>
        </div>
        
        {error && (
          <div className="w-full p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
        
        <div className="flex w-full bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'basic' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Basic Info
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-150 ${activeTab === 'settings' ? 'bg-white text-blue-900 shadow' : 'bg-transparent text-gray-500'}`}
            onClick={() => setActiveTab('settings')}
            type="button"
          >
            Settings
          </button>
        </div>
        
        <form ref={formRef} action={handleSubmit} className="w-full">
          {activeTab === 'basic' && (
            <Card className="max-w-2xl w-full mx-auto p-8 space-y-6 bg-white rounded-2xl border border-[#e5e7eb] shadow-md">
              <CardHeader className="text-black text-[20px] rounded-2xl pb-2">
                <CardTitle className="font-bold text-[20px]">Poll Information</CardTitle>
                <CardDescription className="text-[#6b7280] text-[15px]">Enter the details for your new poll</CardDescription>
              </CardHeader>
              <CardContent className="rounded-2xl">
                <div className="grid gap-4 text-black">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="font-semibold">Poll Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Enter a question or title" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                      required
                      minLength={3}
                      maxLength={200}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Provide more context about your poll" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                      maxLength={1000}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Poll Options <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]"
                            maxLength={100}
                            disabled={isSubmitting}
                            required={index < 2}
                          />
                          {options.length > 2 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeOption(index)}
                              disabled={isSubmitting}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <Button 
                      type="button" 
                      onClick={addOption} 
                      className="bg-[#f3f6fa] text-black border border-[#e5e7eb] rounded-lg font-semibold hover:bg-[#e5e7eb]"
                      disabled={isSubmitting || options.length >= 10}
                    >
                      {options.length >= 10 ? 'Maximum Options Reached' : 'Add Option'}
                    </Button>
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
                    <input type="checkbox" name="allowMultipleSelections" className="h-4 w-4" />
                    Allow multiple selections
                  </label>
                  <label className="flex items-center gap-2 text-black">
                    <input type="checkbox" name="isPublic" className="h-4 w-4" />
                    Make poll results public
                  </label>
                </div>
                <div className="grid gap-2 text-black">
                  <Label htmlFor="endDate" className="font-semibold">Poll End Date (Optional)</Label>
                  <Input id="endDate" name="endDate" type="date" className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end w-full max-w-2xl mt-6">
            <Button
              type="submit"
              className="px-8 py-2 text-white bg-blue-700 rounded-lg font-semibold shadow hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default withAuth(NewPollPage);





