import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white-500 text-black">
        <div className="container mx-auto grid grid-cols-3 items-center p-4">
          <Link href="/" className="font-bold text-[20px] justify-self-start">ALX Polly</Link>

          <nav className="justify-self-center flex items-center gap-6 text-[16px] font-medium">
            <Link href="/polls" className="hover:underline">My Polls</Link>
            <Link href="/polls/new" className="hover:underline">Create Polls</Link>
          </nav>

          <div className="justify-self-end flex items-center gap-4 text-[16px]~">
            <Link href="/polls/new">
              <Button>Create Poll</Button>
            </Link>
            <Link href="/login" aria-label="Login">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-lg">🔐</div>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 mt-6 pb-16">{children}</main>
      <footer className="fixed bottom-0 text-black left-0 right-0 border-t bg-white-500">
        <div className="mx-auto p-4 pt-5 text-[14px] text-muted-foreground text-center">
          © 2025 ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
