'use client'

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShareButtonsProps {
  pollTitle: string;
}

export default function ShareButtons({ pollTitle }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShareTwitter = () => {
    const text = `Check out this poll: ${pollTitle}`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  return (
    <div className="mt-16 pt-10">
      <h3 className="text-2xl font-bold mb-8 text-black">Share this poll</h3>
      <div className="flex justify-center">
        <div className="flex justify-between w-full gap-6">
          <Button 
            variant="outline" 
            className="bg-white text-black hover:bg-gray-100 border-gray-300 flex-1 text-lg py-3 font-bold"
            onClick={handleCopyLink}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </Button>
          <Button 
            variant="outline" 
            className="bg-white text-black hover:bg-gray-100 border-gray-300 flex-1 text-lg py-3 font-bold"
            onClick={handleShareTwitter}
          >
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}
