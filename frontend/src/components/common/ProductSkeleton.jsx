import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden animate-pulse">
      <div className="h-48 bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}
