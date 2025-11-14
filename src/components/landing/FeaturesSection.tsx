"use client";

import { motion } from "framer-motion";
import { Book, DoorOpen, AlertTriangle } from "lucide-react";
import { typography } from "@/styles/typography";

const features = [
  {
    icon: Book,
    title: "Katalog Buku Digital",
    desc: "Cari dan pinjam buku favoritmu. Bayar deposit dengan Midtrans dan dapatkan notifikasi pengembalian."
  },
  {
    icon: DoorOpen,
    title: "Smart Room Booking",
    desc: "Booking ruangan diskusi dengan validasi jam, hari kerja, dan deteksi konflik jadwal otomatis."
  },
  {
    icon: AlertTriangle,
    title: "Denda & Notifikasi",
    desc: "Dapatkan notifikasi otomatis saat ada buku baru, serta pengumuman penting seperti perubahan jam layanan dan lainnya."
  }
];

export default function FeaturesSection() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Judul Section */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
            transition={{ duration: 0.5 }}
            className={typography.h2}
          >
            Fitur Unggulan Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${typography.body} mt-4 text-slate-600`}
          >
            Dibangun dengan teknologi modern untuk pengalaman perpustakaan yang seamless.
          </motion.p>
        </div>
        
        {/* Grid 3 Kartu Fitur */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5 }} // <-- UBAH DI SINI
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className={`${typography.h4} mb-3`}>{feature.title}</h3>
              <p className={`${typography.bodySmall} text-slate-600`}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}