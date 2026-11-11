import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
};

