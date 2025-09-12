import React from "react";

const { memo } = React;

export const Separator = memo(function Separator({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-t border-gray-300 dark:border-gray-700 w-full ${className}`.trim()}
      aria-orientation="horizontal"
    />
  );
});

export default Separator;
