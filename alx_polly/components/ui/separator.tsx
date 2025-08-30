import React from "react";

export function Separator({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-t border-gray-300 dark:border-gray-700 w-full ${className}`.trim()}
      aria-orientation="horizontal"
    />
  );
}

export default Separator;
