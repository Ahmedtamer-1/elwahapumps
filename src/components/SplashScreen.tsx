"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

/**
 * First paint. Pine ground with the reversed mark — this was the third
 * place the old logo PNG was loaded, each in a slightly different green
 * (§1.2b). It now draws the same mark as the header and footer.
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
            <Logo variant="mark" x={26} reversed />
            {/* Brass rule draws in under the mark — the accent, kept to
                a hairline rather than a rounded bar in green.

                It runs the full width of the mark: `self-stretch` takes
                the width from the column's cross size, and the draw-in is a
                scaleX from the centre rather than an animated `width`, which
                resolved against a box the rule was itself helping to size
                and so stopped short of the logo. */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
              className="h-[3px] bg-brass mt-7 self-stretch origin-center"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
