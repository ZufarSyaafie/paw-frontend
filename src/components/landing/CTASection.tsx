"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <div className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-slate-900"
        >
          Siap Membaca dan Berdiskusi?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto mt-4 mb-10"
        >
          Bergabunglah dengan ratusan mahasiswa lain yang sudah merasakan kemudahan perpustakaan digital Naratama.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button asChild size="lg" variant="primary" className="bg-gradient-to-r from-blue-500 via-cyan-400 hover:from-blue-600 hover:via-cyan-500 text-white font-bold py-4 px-8 text-lg rounded-lg transition-all duration-200 active:scale-95">
            <Link href="/sign-up">Daftar Akun Sekarang</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}