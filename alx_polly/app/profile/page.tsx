'use client'

import { useAuth } from "@/app/(auth)/context/authContext";
import withAuth from "@/app/withAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <Button onClick={handleLogout} className="w-full text-[14px]">Logout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(ProfilePage);
