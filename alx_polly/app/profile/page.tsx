

'use client';

import { useAuth } from "@/app/(auth)/context/authContext";
import withAuth from "@/app/withAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";


function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const fullName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const email = user?.email || 'user@email.com';

  return (
    <div className="min-h-screen bg-[#f7fafd] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-5xl font-bold text-white border-4 border-white shadow-lg">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="mt-6 text-3xl font-extrabold text-black">{fullName}</div>
          <div className="text-gray-500 text-lg mt-2">{email}</div>
          <button className="mt-4 px-6 py-2 border border-blue-200 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition text-base">Edit profile</button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
