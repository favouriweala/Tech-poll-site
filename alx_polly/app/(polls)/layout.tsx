'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/(auth)/context/authContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white text-black">
        <div className="container mx-auto grid grid-cols-3 items-center p-4">
          <Link href="/" className="font-bold text-[20px] justify-self-start">ALX Polly</Link>
          <nav className="justify-self-center flex items-center gap-6 text-[16px] font-medium">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/polls" className="hover:underline">My Polls</Link>
            <Link href="/polls/new" className="hover:underline">Create Poll</Link>
          </nav>
          {/* Avatar icon at far right of header */}
          <div className="flex items-center justify-end">
            {session && (
              <div className="flex items-center">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xl font-bold text-white border-2 border-blue-200 shadow hover:scale-105 transition ml-4"
                  aria-label="Open profile menu"
                >
                  {user?.email?.[0]?.toUpperCase()}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-8 top-20 w-64 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 animate-fade-in" style={{minWidth:'220px'}}>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
                      <span></span>
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-200 transition"
                        aria-label="Close profile menu"
                      >
                        <span className="text-gray-500 text-2xl font-bold">&times;</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 px-6 pt-2 pb-4 border-b border-gray-100">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-2xl font-bold text-white border-2 border-blue-200">
                        {user?.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 text-base">{user?.email?.split('@')[0]}</span>
                      <span className="text-gray-500 text-sm">{user?.email}</span>
                    </div>
                    <nav className="flex flex-col gap-1.5 py-5 px-4">
                      <Link href="/profile" className="px-4 py-3 rounded-md text-gray-800 hover:bg-blue-50 transition font-medium">Profile</Link>
                      <Link href="/polls/voted" className="px-4 py-3 rounded-md text-gray-800 hover:bg-blue-50 transition font-medium">Poll results</Link>
                      <Link href="/polls/new?tab=settings" className="px-4 py-3 rounded-md text-gray-800 hover:bg-blue-50 transition font-medium">Settings</Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-md text-red-500 hover:bg-blue-50 transition font-semibold mt-2 text-left"
                      >
                        Sign out
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 mt-6 pb-16">{children}</main>
      <footer className="fixed bottom-0 text-black left-0 right-0 border-t bg-white">
        <div className="mx-auto p-4 pt-5 text-[14px] text-gray-500 text-center">
          © 2025 ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
