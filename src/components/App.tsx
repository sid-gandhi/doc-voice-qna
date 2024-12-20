"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MicIcon, PhoneOff } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded">
      <motion.div className="mt-4" animate={{}}>
        <Button
          //   onClick={toggleCall}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
        >
          <AnimatePresence>
            <motion.div
              key="mic-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <MicIcon size={24} />
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};

export default App;
