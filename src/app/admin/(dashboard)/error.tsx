"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Catches unhandled runtime errors in the admin dashboard (24 of the 26
 * server actions have no try/catch of their own), so a bad Prisma call or
 * a validation edge case shows a recoverable screen instead of Next's bare
 * default error page mid-shift.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Error
        </p>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          The action didn&apos;t complete. Try again, or reload the page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Dashboard home
          </Link>
        </div>
      </div>
    </div>
  );
}
