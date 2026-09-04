'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-4">
        <h2 className="text-h2 font-sans text-error mb-2">
          Something went wrong
        </h2>
        <h2 className="text-h2 font-sans text-error" dir="rtl">
          حدث خطأ ما
        </h2>
      </div>
      <p className="text-body text-stone mb-8 max-w-md">
        We encountered an unexpected error.
        <br />
        <span dir="rtl">لقد واجهنا خطأ غير متوقع.</span>
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-pine text-bone font-sans font-medium hover:bg-field transition-colors"
      >
        Try again / حاول مرة أخرى
      </button>
    </div>
  );
}
