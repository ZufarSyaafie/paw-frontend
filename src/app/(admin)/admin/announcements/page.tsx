"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, Send, AlertCircle } from "lucide-react";
import type { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const formatDate = (input?: string | Date | null) => {
  if (!input) return "N/A";
  try {
    const d = new Date(input as any);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<Set<string>>(new Set());

  const token = getAuthToken();

  const filteredAnnouncements = useMemo(() => announcements, [announcements]);

  async function fetchAnnouncements() {
    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/announcements`, { headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal fetch pengumuman");
      }

      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setAnnouncements([]);
      setError(err?.message || "Terjadi kesalahan saat mengambil pengumuman");
      console.error("fetchAnnouncements error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchAnnouncements();
    else {
      setError("Token Tidak Ditemukan, Silakan Login Ulang.");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (announcementId: string) => {
    if (!announcementId) return;
    if (!window.confirm("Yakin mau kirim ulang email pengumuman ini ke SEMUA user?")) return;

    setIsResending((prev) => {
      const next = new Set(prev);
      next.add(announcementId);
      return next;
    });

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/announcements/${announcementId}/send-emails`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Gagal Mengirim Ulang Email.");
      }

      const result = await res.json();
      const sentCount = result?.emailResult?.sent ?? 0;
      alert(`Email berhasil dikirim ulang ke ${sentCount} user.`);
    } catch (err: any) {
      console.error("handleResend error:", err);
      alert(err?.message || "Gagal memproses.");
    } finally {
      setIsResending((prev) => {
        const next = new Set(prev);
        next.delete(announcementId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
        Manage Announcements
      </h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div
        className="rounded-lg border shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.bgPrimary,
          borderColor: colors.bgTertiary,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead
              className="border-b"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.bgTertiary,
              }}
            >
              <tr>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Judul
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Pesan (Snippet)
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Dibuat
                </th>
                <th className="text-center p-4 font-semibold" style={{ color: colors.textPrimary }}>
                  Resend
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => {
                  const id = ((ann as any)._id ?? (ann as any).id) as string;
                  const isProcessing = isResending.has(id);

                  return (
                    <tr
                      key={id}
                      className="border-b transition-colors hover:opacity-80"
                      style={{
                        borderColor: colors.bgTertiary,
                        backgroundColor: colors.bgPrimary,
                      }}
                    >
                      <td className="p-4 align-top" style={{ color: colors.textPrimary }}>
                        {ann.bookTitle || ann.title}
                      </td>
                      <td className="p-4 align-top text-sm" style={{ color: colors.textSecondary }}>
                        {(ann.message || "").substring(0, 70)}
                        {(ann.message || "").length > 70 ? "..." : ""}
                      </td>
                      <td className="p-4 align-top" style={{ color: colors.textSecondary }}>
                        {formatDate(ann.createdAt)}
                      </td>
                      <td className="p-4 align-top text-center">
                        <Button
                          onClick={() => handleResend(id)}
                          disabled={isProcessing}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex"
                          style={{
                            backgroundColor: isProcessing ? colors.bgTertiary : colors.info,
                            color: "#ffffff",
                          }}
                          title="Resend Email"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#ffffff" }} />
                          ) : (
                            <Send className="w-5 h-5" style={{ color: "#ffffff" }} />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8" style={{ color: colors.textSecondary }}>
                    Belum ada pengumuman yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
