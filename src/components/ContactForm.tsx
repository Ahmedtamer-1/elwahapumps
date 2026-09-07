"use client";

import React, { useState } from "react";
import type { Dictionary } from "../app/[lang]/dictionaries";

interface ContactFormProps {
  lang: string;
  dict: Dictionary;
  /**
   * Pre-fills the subject field, e.g. from a product page's "Request a
   * quote" link (?subject=...). Read server-side from the page's own
   * `searchParams` prop and passed down here, rather than read client-side
   * via useSearchParams — that avoided both an effect that set state on
   * mount (a React Compiler violation: setState synchronously inside an
   * effect body) and the Suspense boundary useSearchParams requires.
   */
  initialSubject?: string;
}

export default function ContactForm({ lang, dict, initialSubject }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: initialSubject ?? "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
      <h3 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">
        {dict.contactPage.formTitle}
      </h3>

      {status === "success" && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-100">
          {dict.contactPage.success}
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100">
          {dict.contactPage.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
            {dict.contactPage.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g., John Doe"}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-700 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
              {dict.contactPage.phone} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: 01066685532" : "e.g., +20 106 668 5532"}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-700 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
              {dict.contactPage.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: client@example.com" : "e.g., client@example.com"}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-700 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
            {dict.contactPage.subject} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            placeholder={lang === "ar" ? "الموضوع أو الخدمة المطلوبة" : "Subject or required service"}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
            {dict.contactPage.message} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder={lang === "ar" ? "تفاصيل الطلب أو الاستفسار..." : "Inquiry details..."}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-neutral-700 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className={`w-full py-3 px-6 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-300 ${
            status === "sending"
              ? "bg-neutral-400 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 active:scale-98"
          }`}
        >
          {status === "sending" ? dict.contactPage.sending : dict.contactPage.submit}
        </button>
      </form>
    </div>
  );
}
