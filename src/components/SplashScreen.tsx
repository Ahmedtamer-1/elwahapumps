"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

/**
 * First paint. Pine ground with the reversed lockup — this was the third
 * place the old logo PNG was loaded, each in a slightly different green
 * (§1.2b). It now draws the same lockup as the header and footer.
 */
export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide after 1.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] bg-pine flex items-center justify-center pointer-events-none"
          aria-hidden="true"
          data-splash=""
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Logo variant="lockup" x={26} reversed />
            {/* Brass rule draws in under the lockup — the accent, kept to
                a hairline rather than a rounded bar in green. */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
              className="h-[3px] bg-brass mt-7"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
