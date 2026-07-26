"use client";

import { motion } from "framer-motion";
import React from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";

  return (
    <motion.div
      initial={{ opacity: 0.7, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className={`flex flex-col min-h-screen bg-white ${isHome ? "" : "pt-[72px] sm:pt-[80px]"}`}
    >
      {children}
    </motion.div>
  );
}
