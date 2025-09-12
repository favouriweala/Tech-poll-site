/**
 * Dashboard Page Component
 * 
 * WHAT: Main dashboard interface for authenticated users providing a comprehensive overview
 * of their polling activity, statistics, and poll management capabilities.
 * 
 * WHY: A centralized dashboard is necessary because:
 * 1. Users need a single place to view all their polling activity
 * 2. Statistics provide valuable insights into poll performance and engagement
 * 3. Quick access to poll management reduces friction for content creators
 * 4. Visual statistics motivate continued engagement with the platform
 * 5. Empty states guide new users toward creating their first poll
 * 
 * HOW: Server-side rendering with parallel data fetching:
 * - Authentication verification prevents unauthorized access
 * - Parallel Promise.all() fetches user polls and public polls simultaneously
 * - Statistics are calculated from aggregated poll data
 * - Responsive grid layout adapts to different screen sizes
 * - UserPollsList component handles complex poll management features
 * 
 * Features:
 * - User authentication verification
 * - Statistics overview (polls created, votes received, etc.)
 * - Poll management interface with edit/delete capabilities
 * - Quick poll creation access
 * - Responsive design with gradient statistics cards
 * - Empty state handling for new users
 * 
 * Data Sources:
 * - User's created polls with statistics
 * - Public polls count for context
 * - Real-time vote counts and poll status
 * 
 * @component
 * @returns Dashboard interface for authenticated users
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../../components/ui/separator";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserPolls, getPublicPolls } from "@/lib/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserPollsList from "./UserPollsList";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/**
 * Dashboard Component Implementation
 * 
 * Server component that fetches user data and renders the dashboard interface.
 * Handles authentication verification and data aggregation for statistics display.
 */
async function Dashboard() {
  // Get current user
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch user's polls and general statistics
  const [userPolls, allPolls] = await Promise.all([
    getUserPolls(user.id),
    getPublicPolls()
  ]);

  // Calculate statistics
  const totalUserPolls = userPolls.length;
  const totalVotesOnUserPolls = userPolls.reduce((sum, poll) => sum + (poll.total_votes || 0), 0);
  const totalPublicPolls = allPolls.length;
  const activeUserPolls = userPolls.filter(poll => poll.is_active).length;

  return (
    <section className="min-h-[80vh] bg-[#f7fafd] py-12 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-black mb-4 tracking-tight">
            Welcome back, {user.user_metadata?.full_name || user.email?.split("@")?.[0] || "User"}! 👋
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Manage your polls, view statistics, and create new polls from your dashboard.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-400 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm font-medium">Your Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUserPolls}</div>
              <p className="text-white/80 text-sm">{activeUserPolls} active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-400 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm font-medium">Total Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalVotesOnUserPolls}</div>
              <p className="text-white/80 text-sm">on your polls</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-400 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm font-medium">Public Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPublicPolls}</div>
              <p className="text-white/80 text-sm">total available</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-400 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm font-medium">Unique Voters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userPolls.reduce((sum, poll) => sum + (poll.unique_voters || 0), 0)}
              </div>
              <p className="text-white/80 text-sm">participated</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <Link href="/polls/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-8 py-3 text-lg shadow-lg">
              ✨ Create New Poll
            </Button>
          </Link>
          <Link href="/polls">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg px-8 py-3 text-lg shadow-lg">
              🌐 Browse All Polls
            </Button>
          </Link>
        </div>

        <Separator className="mb-12" />

        {/* User's Polls Management */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-black">Your Polls</h2>
            <Link href="/polls/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Poll
              </Button>
            </Link>
          </div>

          {totalUserPolls === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">No polls yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any polls yet. Start by creating your first poll!
                </p>
                <Link href="/polls/new">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-2">
                    Create Your First Poll
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <UserPollsList polls={userPolls} userId={user.id} />
          )}
        </div>
      </div>
    </section>
  );
}

export default function DashboardWrapper() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

