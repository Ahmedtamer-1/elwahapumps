import { getDictionary, Locale } from "../dictionaries";

export default async function CataloguesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-neutral-50">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
          {dict.nav.catalogues || "Catalogues"}
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {lang === "ar"
            ? "هذه الصفحة قيد الإنشاء. يرجى التحقق مرة أخرى قريباً."
            : "This page is currently under construction. Please check back soon."}
        </p>
      </div>
    </div>
  );
}
