"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ContactFormProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    <div className="w-full bg-white border border-rule border-t-[3px] border-t-pine px-4 py-6 md:p-10">
      <span className="font-mono font-medium text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-stone mb-2 md:mb-3 block">
        {dict.contactPage.formTitle || "Send an Inquiry"}
      </span>
      <h2 className="text-[21px] md:text-2xl font-extrabold text-ink tracking-tight mb-5 md:mb-7">
        Tell us about the well
      </h2>

      {status === "success" && (
        <div className="mb-6 p-4 bg-bone text-pine text-sm font-bold border-l-4 border-pine">
          {dict.contactPage.success}
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 text-error text-sm font-bold border-l-4 border-error">
          {dict.contactPage.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-[12px] font-bold text-ink mb-1.5">
              {dict.contactPage.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g., John Doe"}
              className="w-full px-3.5 py-3.5 border border-rule/60 focus:border-pine outline-none text-[13.5px] text-ink transition-colors bg-white font-normal rounded-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[12px] font-bold text-ink mb-1.5">
              {dict.contactPage.phone}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: 01066685532" : "e.g., +20 106 668 5532"}
              className="w-full px-3.5 py-3.5 border border-rule/60 focus:border-pine outline-none text-[13.5px] text-stone font-mono transition-colors bg-white rounded-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[12px] font-bold text-ink mb-1.5">
              {dict.contactPage.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={lang === "ar" ? "مثال: client@example.com" : "e.g., client@example.com"}
              className="w-full px-3.5 py-3.5 border border-rule/60 focus:border-pine outline-none text-[13.5px] text-stone font-mono transition-colors bg-white rounded-none"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-[12px] font-bold text-ink mb-1.5">
              {dict.contactPage.subject}
            </label>
            <div className="relative">
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3.5 py-3.5 border border-rule/60 focus:border-pine outline-none text-[13.5px] text-ink transition-colors bg-white font-normal appearance-none rounded-none pr-10"
              >
                <option value="">{lang === "ar" ? "اختر الخدمة المطلوبة" : "Select required service"}</option>
                <option value="Supply & Installation">{lang === "ar" ? "توريد وتركيب" : "Supply & installation"}</option>
                <option value="Maintenance">{lang === "ar" ? "صيانة" : "Maintenance"}</option>
                <option value="Other">{lang === "ar" ? "أخرى" : "Other"}</option>
              </select>
              <div className="absolute top-0 right-0 h-full flex items-center pr-3.5 pointer-events-none text-stone">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="message" className="block text-[12px] font-bold text-ink mb-1.5">
            {dict.contactPage.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder={lang === "ar" ? "عمق البئر، الإنتاجية المقاسة، المنسوب الثابت، والمحافظة..." : "Well depth, measured yield, static head and the governorate..."}
            className="w-full px-3.5 py-3.5 border border-rule/60 focus:border-pine outline-none text-[13.5px] leading-[22px] text-stone transition-colors resize-none bg-white font-normal rounded-none"
          />
        </div>

        <div className="mt-5 md:mt-6 flex flex-col md:flex-row items-center gap-4 md:gap-5">
          <button
            type="submit"
            disabled={status === "sending"}
            className={`w-full md:w-auto py-4 px-8 text-bone font-bold text-[13.5px] transition-colors rounded-none ${
              status === "sending"
                ? "bg-pine/70 cursor-not-allowed"
                : "bg-pine hover:bg-field active-scale-98"
            }`}
          >
            {status === "sending" ? dict.contactPage.sending : dict.contactPage.submit || "Send Message"}
          </button>
          <span className="text-[12px] leading-[20px] text-stone-light max-w-full md:max-w-[36ch] text-center md:text-left">
            {lang === "ar" ? "نرد خلال يوم عمل واحد. إذا كان البئر متوقفًا، يرجى الاتصال بدلاً من ذلك." : "We reply within one working day. For a well that has stopped, call instead."}
          </span>
        </div>
      </form>
    </div>
  );
}

export default function ContactForm(props: ContactFormProps) {
  return (
    <Suspense fallback={
      <div className="w-full bg-white border border-rule border-t-[3px] border-t-pine p-10 animate-pulse">
        <div className="h-4 bg-bone w-1/4 mb-3"></div>
        <div className="h-8 bg-bone w-2/3 mb-7"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="h-[50px] bg-bone"></div>
          <div className="h-[50px] bg-bone"></div>
          <div className="h-[50px] bg-bone"></div>
          <div className="h-[50px] bg-bone"></div>
        </div>
        <div className="h-[130px] bg-bone mb-6"></div>
        <div className="h-[50px] bg-bone w-40"></div>
      </div>
    }>
      <ContactFormContent {...props} />
    </Suspense>
  );
}
