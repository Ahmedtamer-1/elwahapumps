import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  // Already signed in — skip the form.
  if (await getCurrentUser()) redirect("/admin");

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-0 md:p-8">
      <div className="w-full max-w-[1280px] bg-white border border-rule shadow-[0_2px_10px_rgba(0,0,0,0.07)] grid grid-cols-1 lg:grid-cols-2 min-h-[660px]">
        
        {/* Left Column */}
        <div className="relative bg-pine p-14 pb-12 flex flex-col justify-between overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-35" 
            style={{ backgroundImage: 'url("/images/services/well-site.webp")' }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pine/88 to-pine/96" />
          
          <div className="relative">
            <Logo variant="lockup" x={17} reversed />
          </div>

          <div className="relative mt-16 lg:mt-24">
            <div className="h-[3px] w-[64px] bg-brass mb-6" />
            <h2 className="m-0 font-extrabold text-[32px] leading-[38px] tracking-[-0.03em] text-bone max-w-[22ch] text-balance">
              Your quotations, inquiries and service history in one place.
            </h2>
            <p className="mt-[18px] font-normal text-[14px] leading-[24px] text-bone/70 max-w-[44ch]">
              Customers see every enquiry they have raised, the quotations against them, and the maintenance record of each well we service.
            </p>
          </div>

          <div className="relative mt-16 lg:mt-24 flex gap-8 border-t border-bone/15 pt-5">
            <div>
              <div className="font-extrabold text-[20px] text-brass">230+</div>
              <div className="mt-1 font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-bone/55">Projects</div>
            </div>
            <div>
              <div className="font-extrabold text-[20px] text-brass">24 / 7</div>
              <div className="mt-1 font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-bone/55">Response</div>
            </div>
            <div>
              <div className="font-extrabold text-[20px] text-brass">ISO 9001</div>
              <div className="mt-1 font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-bone/55">Certified</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white p-14 lg:px-[72px] flex flex-col justify-center">
          <div className="font-medium text-[11px] font-mono tracking-[0.16em] uppercase text-stone">
            Account
          </div>
          <h1 className="mt-3 font-extrabold text-[30px] leading-[36px] tracking-[-0.025em] text-ink">
            Sign in
          </h1>
          <div className="h-[2px] w-[48px] bg-brass my-5 mb-7" />

          <Suspense fallback={<div className="h-64 animate-pulse bg-bone" />}>
            <LoginForm />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
