"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ContactFormProps {
  lang: string;
  dict: any;
}

/**
 * The enquiry form — the page's whole job, so it is set as a plate.
 *
 * Field labels use the mono spec label the rest of the site opens sections
 * with: a form asking for a duty point and a site is a specification being
 * filled in, and the label column reads that way. The `[dir=rtl]` rules in
 * globals.css drop the uppercase and the tracking for Arabic automatically,
 * so one class serves both scripts.
 */
function ContactFormContent({ lang, dict }: ContactFormProps) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams]);

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

  /* One input treatment, declared once. Square, hairline, pine on focus —
     brass would fail on white (§04 Table 3), so the focus state borrows the
     primary instead of the accent. */
  const inputClass =
    "w-full px-4 py-3 border border-rule bg-white text-ink text-sm placeholder:text-stone " +
    "focus:border-pine focus:ring-1 focus:ring-pine outline-none transition-colors";

  return (
    <div className="w-full bg-white border-t-2 border-pine border-x border-b border-rule p-6 md:p-8">
      <h3 className="text-h3 font-extrabold text-pine mb-6 border-b border-rule pb-4">
        {dict.contactPage.formTitle}
      </h3>

      {status === "success" && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
          {dict.contactPage.success}
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold border border-error/30">
          {dict.contactPage.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="spec-label block mb-2">
            {dict.contactPage.name} <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g., John Doe"}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="spec-label block mb-2">
              {dict.contactPage.phone} <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: 01066685532" : "e.g., +20 106 668 5532"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className="spec-label block mb-2">
              {dict.contactPage.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: client@example.com" : "e.g., client@example.com"}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="spec-label block mb-2">
            {dict.contactPage.subject} <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            placeholder={lang === "ar" ? "الموضوع أو الخدمة المطلوبة" : "Subject or required service"}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="message" className="spec-label block mb-2">
            {dict.contactPage.message} <span className="text-error">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder={lang === "ar" ? "تفاصيل الطلب أو الاستفسار..." : "Inquiry details..."}
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className={`w-full py-4 px-6 text-bone font-semibold text-sm transition-colors duration-200 ${
              status === "sending"
              ? "bg-stone-light cursor-not-allowed"
              : "bg-pine hover:bg-emerald-700 active-scale-98"
          }`}
        >
          {status === "sending" ? dict.contactPage.sending : dict.contactPage.submit}
        </button>
      </form>
    </div>
  );
}

export default function ContactForm(props: ContactFormProps) {
  return (
    <Suspense fallback={
      <div className="w-full bg-white border-t-2 border-pine border-x border-b border-rule p-6 md:p-8 animate-pulse">
        <div className="h-6 bg-surface-container-high w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-11 bg-bone w-full"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-11 bg-bone"></div>
            <div className="h-11 bg-bone"></div>
          </div>
          <div className="h-11 bg-bone w-full"></div>
          <div className="h-28 bg-bone w-full"></div>
          <div className="h-13 bg-surface-container-high w-full"></div>
        </div>
      </div>
    }>
      <ContactFormContent {...props} />
    </Suspense>
  );
}
