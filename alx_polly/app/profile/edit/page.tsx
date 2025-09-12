'use client';

import { useState, useCallback, useId, useEffect } from 'react';
import { useAuth } from '@/app/(auth)/context/authContext';
import withAuth from '@/app/withAuth';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Save, User, Eye, EyeOff } from 'lucide-react';
import { UserProfileSchema, PasswordSchema, validatePasswordStrength } from '@/lib/validation-utils';

type ProfileFormData = {
  fullName: string;
  email: string;
  bio?: string;
};
type PasswordFormData = z.infer<typeof PasswordSchema>;

/**
 * Enhanced Profile Edit Page Component
 * 
 * WHAT: Secure profile editing form with comprehensive validation and sanitization
 * WHY: Allows users to update their profile information safely with proper security measures
 * HOW: Implements client-side validation, input sanitization, and proper error handling
 */
function EditProfilePageContent() {
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isValid: boolean } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      bio: user?.user_metadata?.bio || undefined
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Generate unique IDs for accessibility
  const nameId = useId();
  const emailId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const errorId = useId();
  const successId = useId();

  // Watch password field for strength validation
  const newPassword = passwordForm.watch('newPassword');
  useEffect(() => {
    if (newPassword) {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          email: data.email,
          bio: data.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw new Error('Failed to update profile information');
      }

      // Update email in auth if it changed
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (emailError) {
          throw new Error('Failed to update email address');
        }
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName
        }
      });

      if (metadataError) {
        console.warn('Failed to update user metadata:', metadataError);
        // Don't throw error as profile update was successful
      }

      setSuccessMsg('Profile updated successfully!');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          setErrorMsg('Failed to update email. Please check if the email is already in use.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (passwordError) {
        throw new Error('Failed to update password');
      }

      // Clear password fields on success
      passwordForm.reset();
      setShowPasswordFields(false);
      setPasswordStrength(null);

      setSuccessMsg('Password updated successfully!');
      
    } catch (error) {
      console.error('Password update error:', error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const togglePasswordFields = useCallback(() => {
    setShowPasswordFields(prev => !prev);
    // Clear password fields when hiding
    if (showPasswordFields) {
      passwordForm.reset();
      setPasswordStrength(null);
    }
    setErrorMsg('');
  }, [showPasswordFields, passwordForm]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your profile information and security settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Keep your profile information up to date for the best experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6" noValidate>
              {/* Success Message */}
              {successMsg && (
                <Alert className="border-green-200 bg-green-50" role="alert" aria-describedby={successId}>
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription id={successId} className="text-green-800">
                    {successMsg}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {errorMsg && (
                <Alert variant="destructive" role="alert" aria-describedby={errorId}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id={errorId}>
                    {errorMsg}
                  </AlertDescription>
                </Alert>
              )}

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor={nameId} className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id={nameId}
                  type="text"
                  {...profileForm.register('fullName')}
                  placeholder="Enter your full name"
                  required
                  maxLength={50}
                  className="w-full"
                  aria-describedby={errorMsg ? errorId : undefined}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.fullName && (
                  <p className="text-sm text-red-600">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor={emailId} className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id={emailId}
                  type="email"
                  {...profileForm.register('email')}
                  placeholder="Enter your email address"
                  required
                  className="w-full"
                  aria-describedby={errorMsg ? errorId : undefined}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Changing your email will require verification.
                </p>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  {...profileForm.register('bio')}
                  placeholder="Tell us about yourself (optional)"
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  aria-describedby={errorMsg ? errorId : undefined}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.bio && (
                  <p className="text-sm text-red-600">{profileForm.formState.errors.bio.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Maximum 500 characters
                </p>
              </div>

              {/* Password Section Toggle */}
              <div className="border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={togglePasswordFields}
                  className="mb-4"
                  disabled={isLoading}
                >
                  {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                </Button>

                {/* Password Fields */}
                {showPasswordFields && (
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={currentPasswordId} className="text-sm font-medium text-gray-700">
                        Current Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id={currentPasswordId}
                          type={showCurrentPassword ? "text" : "password"}
                          {...passwordForm.register('currentPassword')}
                          placeholder="Enter your current password"
                          required={showPasswordFields}
                          className="w-full pr-10"
                          aria-describedby={errorMsg ? errorId : undefined}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={newPasswordId} className="text-sm font-medium text-gray-700">
                        New Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id={newPasswordId}
                          type={showNewPassword ? "text" : "password"}
                          {...passwordForm.register('newPassword')}
                          placeholder="Enter your new password"
                          required={showPasswordFields}
                          minLength={8}
                          className="w-full pr-10"
                          aria-describedby={errorMsg ? errorId : undefined}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordStrength && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  passwordStrength.score < 2 ? 'bg-red-500' :
                                  passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score < 2 ? 'text-red-600' :
                              passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {passwordStrength.score < 2 ? 'Weak' :
                               passwordStrength.score < 4 ? 'Good' : 'Strong'}
                            </span>
                          </div>
                          {passwordStrength.feedback.length > 0 && (
                            <ul className="text-xs text-gray-600 space-y-1">
                              {passwordStrength.feedback.map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={confirmPasswordId} className="text-sm font-medium text-gray-700">
                        Confirm New Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id={confirmPasswordId}
                          type={showConfirmPassword ? "text" : "password"}
                          {...passwordForm.register('confirmPassword')}
                          placeholder="Confirm your new password"
                          required={showPasswordFields}
                          minLength={8}
                          className="w-full pr-10"
                          aria-describedby={errorMsg ? errorId : undefined}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !passwordStrength?.isValid}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Updating Password...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(EditProfilePageContent);