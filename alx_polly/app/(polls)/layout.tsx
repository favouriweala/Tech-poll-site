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
            <Link href="/polls" className="hover:underline">My Polls</Link>
            <Link href="/polls/new" className="hover:underline">Create Poll</Link>
          </nav>
          <div className="justify-self-end flex items-center gap-4 text-[16px]">
            {session ? (
              <>
                <Link href="/polls/new" passHref>
                  <Button>
                    <span>Create Poll</span>
                  </Button>
                </Link>
                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                    {user?.email?.[0].toUpperCase()}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link href="/polls/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" passHref>
                <Button>
                  <span>Login</span>
                </Button>
              </Link>
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
