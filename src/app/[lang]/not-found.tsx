import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-display font-sans text-pine mb-4">404</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
        <p className="text-body text-ink">Page not found.</p>
        <span className="hidden md:inline text-stone">|</span>
        <p className="text-body text-ink" dir="rtl">الصفحة غير موجودة.</p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 bg-pine text-bone font-sans font-medium hover:bg-field transition-colors inline-block"
      >
        Return Home / العودة للرئيسية
      </Link>
    </div>
  );
}
