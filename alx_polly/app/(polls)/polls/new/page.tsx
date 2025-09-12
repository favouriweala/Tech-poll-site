
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import withAuth from "@/app/withAuth";
import { createPoll } from "@/lib/actions";
import { PollCreationSchema, validateRateLimit } from '@/lib/validation-utils';
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PollFormData = z.infer<typeof PollCreationSchema>;

function NewPollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(PollCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ text: '' }, { text: '' }],
      allowMultipleSelections: false,
      isPublic: true,
      endDate: undefined
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options'
  });

  const addOption = () => {
    if (fields.length < 10) {
      append({ text: '' });
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const rateLimit = validateRateLimit('create_poll', 5, 300000); // 5 polls per 5 minutes
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString();
      setRateLimitError(`Too many poll creation attempts. Please try again after ${resetTime}.`);
      return false;
    }
    setRateLimitError(null);
    return true;
  };

  // Clear errors when user starts typing
  const clearErrors = () => {
    if (error) setError(null);
    if (rateLimitError) setRateLimitError(null);
  };



  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check rate limiting
      if (!checkRateLimit()) {
        setIsSubmitting(false);
        return;
      }

      // Validate end date if provided
      let endDate = null;
      if (data.endDate) {
        endDate = new Date(data.endDate);
        if (endDate <= new Date()) {
          throw new Error('End date must be in the future');
        }
      }

      const pollData = {
        title: data.title,
        description: data.description || null,
        options: data.options,
        allowMultipleSelections: data.allowMultipleSelections,
        isPublic: data.isPublic,
        endDate: endDate ? endDate.toISOString() : null
      };

      const result = await createPoll(pollData);
      
      if (result.success && result.data) {
        // Clear rate limiting data on successful creation
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rate_limit_create_poll');
        }
        router.push(`/polls/${result.data.pollId}`);
      } else {
        throw new Error(result.error || 'Failed to create poll');
      }
    } catch (error: any) {
      console.error('Poll creation error:', error);
      setError(error.message || 'An error occurred while creating the poll');
    } finally {
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
        
        {(error || rateLimitError) && (
          <Alert className="w-full mb-6" variant="destructive">
            <AlertDescription>
              {error || rateLimitError}
            </AlertDescription>
          </Alert>
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
        
        <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
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
                      {...form.register('title')}
                      onChange={(e) => {
                        form.setValue('title', e.target.value);
                        clearErrors();
                      }}
                      placeholder="Enter a question or title" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                      required
                      minLength={3}
                      maxLength={200}
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      {...form.register('description')}
                      onChange={(e) => {
                        form.setValue('description', e.target.value);
                        clearErrors();
                      }}
                      placeholder="Provide more context about your poll" 
                      className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                      maxLength={1000}
                      disabled={isSubmitting}
                      rows={3}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-semibold">Poll Options <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              {...form.register(`options.${index}.text`)}
                              onChange={(e) => {
                                form.setValue(`options.${index}.text`, e.target.value);
                                clearErrors();
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]"
                              maxLength={100}
                              disabled={isSubmitting}
                              required={index < 2}
                            />
                            {fields.length > 2 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeOption(index)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {form.formState.errors.options?.[index]?.text && (
                            <p className="text-sm text-red-600">{form.formState.errors.options[index]?.text?.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.options && typeof form.formState.errors.options === 'object' && 'message' in form.formState.errors.options && (
                      <p className="text-sm text-red-600">{form.formState.errors.options.message}</p>
                    )}
                  </div>
                  <div className="flex justify-start">
                    <Button 
                      type="button" 
                      onClick={addOption} 
                      className="bg-[#f3f6fa] text-black border border-[#e5e7eb] rounded-lg font-semibold hover:bg-[#e5e7eb]"
                      disabled={isSubmitting || fields.length >= 10}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {fields.length >= 10 ? 'Maximum Options Reached' : 'Add Option'}
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
                    <input 
                      type="checkbox" 
                      checked={form.watch('allowMultipleSelections')}
                      onChange={(e) => {
                        form.setValue('allowMultipleSelections', e.target.checked);
                        clearErrors();
                      }}
                      className="h-4 w-4" 
                    />
                    Allow multiple selections
                  </label>
                  <label className="flex items-center gap-2 text-black">
                    <input 
                      type="checkbox" 
                      checked={form.watch('isPublic')}
                      onChange={(e) => {
                        form.setValue('isPublic', e.target.checked);
                        clearErrors();
                      }}
                      className="h-4 w-4" 
                    />
                    Make poll results public
                  </label>
                </div>
                <div className="grid gap-2 text-black">
                  <Label htmlFor="endDate" className="font-semibold">Poll End Date (Optional)</Label>
                  <Input 
                    id="endDate" 
                    {...form.register('endDate')}
                    onChange={(e) => {
                      form.setValue('endDate', e.target.value || undefined);
                      clearErrors();
                    }}
                    type="date" 
                    className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" 
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.endDate.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end w-full max-w-2xl mt-6">
            <Button
              type="submit"
              className="px-8 py-2 text-white bg-blue-700 rounded-lg font-semibold shadow hover:bg-blue-800"
              disabled={isSubmitting || !!rateLimitError}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Poll...
                </>
              ) : (
                'Create Poll'
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

const NewPollPageWithAuth = withAuth(NewPollPage);

export default function NewPollPageWrapper() {
  return (
    <ErrorBoundary>
      <NewPollPageWithAuth />
    </ErrorBoundary>
  );
}





