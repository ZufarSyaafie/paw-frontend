"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { colors } from "@/styles/colors";

export default function HeroSection() {
  return (
    <div 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: colors.authBg }} // Pake background auth lu yg keren
    >
      {/* Konten di Tengah */}
      <div className="relative z-10 text-center p-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Welcome to
          <br />
          <span className="text-cyan-400">Naratama Digital Library</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          An integrated platform for book lending, room reservations, member management, and automated notifications.
          Designed to make library services faster, more accurate, and more convenient.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button asChild size="lg" variant="primary" className="bg-gradient-to-r from-blue-500 via-cyan-400 hover:from-blue-600 hover:via-cyan-500 text-white font-bold py-4 px-8 text-lg rounded-lg transition-all duration-200 active:scale-95">
            <Link href="/sign-up">Join Now, it's Free!</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}