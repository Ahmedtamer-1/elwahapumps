import React from "react";
import Link from "next/link";
import {
  Droplet,
  Cpu,
  Layers,
  Wrench,
  Settings,
  Package,
  Grid
} from "lucide-react";

// Icon mapping to prevent bundling the entire lucide library
const iconMap = {
  "pump-supply": Droplet,
  "panel-design": Cpu,
  "marine-cable-supply": Layers,
  "well-pipe-supply": Grid,
  "spare-parts-supply": Package,
  "pump-maintenance": Wrench,
  "motor-maintenance": Settings,
  "panel-maintenance": HammerIcon, // We'll map below
};

// Simple wrapper since Hammer might not be in all lucide versions or named differently
function HammerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 5 4 4" />
      <path d="M21.5 12a9 9 0 1 1-9-9c.2 0 .4 0 .6.1" />
      <path d="m9 11 3 3" />
      <path d="m15 15 5 5" />
      <path d="M11 9H5" />
    </svg>
  );
}

interface ServiceCardProps {
  id: string;
  title: string;
  short: string;
  lang: string;
}

export default function ServiceCard({ id, title, short, lang }: ServiceCardProps) {
  // Determine icon to render
  const IconComponent = iconMap[id as keyof typeof iconMap] || Droplet;

  return (
    <div className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-emerald-500/50 hover:-translate-y-1">
      <div>
        <div className="inline-flex items-center justify-center p-3 mb-5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {short}
        </p>
      </div>

      <Link
        href={`/${lang}/services/${id}`}
        className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mt-auto group/link"
      >
        {lang === "ar" ? "اقرأ المزيد" : "Learn More"}
        <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 ms-1">
          {lang === "ar" ? "←" : "→"}
        </span>
      </Link>
    </div>
  );
}
