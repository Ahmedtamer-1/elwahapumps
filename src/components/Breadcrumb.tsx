import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  lang: string;
}

export default function Breadcrumb({ items, lang }: BreadcrumbProps) {
  return (
    <nav className="flex text-[11px] font-medium text-slate-500 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link href={`/${lang}`} className="hover:text-emerald-600 transition-colors">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 mx-1 rtl:rotate-180" />
                {isLast || !item.href ? (
                  <span className="text-slate-800 font-semibold">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-emerald-600 transition-colors">
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
