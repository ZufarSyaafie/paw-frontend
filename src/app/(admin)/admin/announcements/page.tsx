"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, Send, AlertCircle, Search, Filter } from "lucide-react";
import type { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function ManageAnnouncementsPage(): React.JSX.Element {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<Set<string>>(new Set());

  // filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const token = getAuthToken();

  async function fetchAnnouncements(showLoading = true) {
    if (showLoading) setIsLoading(true);
    setError(null);
    
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/announcements`, { headers });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Server responded ${res.status}`);
      }

      const data = await res.json().catch(() => null);
      const arr: Announcement[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setAnnouncements(arr);
    } catch (err: any) {
      setAnnouncements([]);
      if (showLoading) {
         setError(err?.message || "An error occurred while trying to fetch the announcement");
      }
      console.error("fetchAnnouncements error:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchAnnouncements(true)
    } else {
      setError("Token unfound. Please sign-in again.");
      setIsLoading(false);
    }

    const onUpdated = () => fetchAnnouncements(false);
    window.addEventListener("announcements:updated", onUpdated);
    return () => window.removeEventListener("announcements:updated", onUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredAnnouncements = useMemo(() => {
    const q = search.toLowerCase().trim();

    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return announcements.filter((ann) => {
      const title = (ann.title ?? ann.bookTitle ?? "").toLowerCase();
      const message = (ann.message ?? "").toLowerCase();
      const searchMatch = !q || title.includes(q) || message.includes(q);
      if (!searchMatch) return false;

      const createdAt = ann.createdAt ? new Date(ann.createdAt) : null;
      if (!createdAt) return true;
      if (start && createdAt < start) return false;
      if (end && createdAt > end) return false;

      return true;
    });
  }, [announcements, search, startDate, endDate]);

  const handleResend = async (announcementId: string) => {
    if (!announcementId) return;
    if (!window.confirm("Are you sure you want to resend this announcement email to all users?")) return;

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
        throw new Error(j?.message || "Failed to Resend Email.");
      }

      const result = await res.json().catch(() => ({}));
      const sentCount = result?.emailResult?.sent ?? result?.sent ?? 0;
      window.alert(`Email successfully resent to ${sentCount} users.`);
    } catch (err: any) {
      console.error("handleResend error:", err);
      window.alert(err?.message || "Failed to process.");
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

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex-shrink-0" style={{ color: colors.textSecondary }} />
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search for title or message..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm"
            style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, borderColor: colors.bgTertiary }}
            onFocus={(e: any) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
            }}
            onBlur={(e: any) => {
              e.currentTarget.style.borderColor = colors.bgTertiary;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Tombol Filter Mobile */}
        <div className="sm:hidden w-full">
          <Button
            variant="secondary"
            className="w-full justify-center px-3 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            <span>Date Filter</span>
          </Button>
        </div>

        {/* Filter Tanggal Desktop */}
        <div className="hidden sm:flex gap-2 flex-shrink-0 items-center">
          <label htmlFor="startDate" className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            From Date:
          </label>
          <Input id="startDate" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 rounded-lg border text-sm" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
          <label htmlFor="endDate" className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            To Date:
          </label>
          <Input id="endDate" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 rounded-lg border text-sm" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
          <Button variant="secondary" className="ml-2 px-3 py-1.5" onClick={() => { setStartDate(""); setEndDate(""); }}>Clear</Button>
        </div>
      </div>

      {/* Panel Filter Mobile */}
      {showFilters && (
        <div className="sm:hidden rounded-lg p-4 sm:p-6 border space-y-4 mb-4" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
          <div>
            <p className="text-sm uppercase mb-3 font-bold" style={{ color: colors.textPrimary }}>
              Filter by Date
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="startDateMobile" className="text-sm font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  From Date:
                </label>
                <Input id="startDateMobile" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
              </div>
              <div>
                <label htmlFor="endDateMobile" className="text-sm font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  To Date:
                </label>
                <Input id="endDateMobile" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => { setStartDate(""); setEndDate(""); }} className="px-3 py-1.5 rounded-md text-sm">Clear</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Grid Panel, Tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Quick Announcement */}
        <div className="lg:col-span-1 lg:order-last">
          <QuickAnnouncementPanel onAnnouncementCreated={fetchAnnouncements} />
        </div>

        {/* Tabel List Pengumuman */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border shadow-sm overflow-hidden" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.bgTertiary }}>
                  <tr>
                    <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Title</th>
                    <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Snippet</th>
                    <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Created At</th>
                    <th className="text-center p-4 font-semibold" style={{ color: colors.textPrimary }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((ann) => {
                      const id = ((ann as any)._id ?? (ann as any).id) as string;
                      const isProcessing = isResending.has(id);

                      return (
                        <tr key={id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: colors.bgTertiary, backgroundColor: colors.bgPrimary }}>
                          <td className="p-4 align-top" style={{ color: colors.textPrimary }}>{ann.bookTitle ?? ann.title}</td>
                          <td className="p-4 align-top text-sm" style={{ color: colors.textSecondary }}>{(ann.message ?? "").substring(0, 140)}{(ann.message ?? "").length > 140 ? "..." : ""}</td>
                          <td className="p-4 align-top" style={{ color: colors.textSecondary }}>{formatDate(ann.createdAt)}</td>
                          <td className="p-4 align-top text-center">
                            <Button onClick={() => handleResend(id)} disabled={isProcessing} className="px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex items-center gap-1.5" style={{ backgroundColor: isProcessing ? colors.bgTertiary : colors.info, color: "#ffffff" }} title="resend email">
                              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#ffffff" }} /> : <><Send className="w-5 h-5" style={{ color: "#ffffff" }} /><span className="text-sm">Resend</span></>}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center p-8" style={{ color: colors.textSecondary }}>{search || startDate || endDate ? "No announcements match the filter." : "No announcement has been made yet."}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Announcement
function QuickAnnouncementPanel({ onAnnouncementCreated }: { onAnnouncementCreated: () => void }) {
  const [announcementType, setAnnouncementType] = useState<"general" | "book">("general");
  const [title, setTitle] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const token = getAuthToken();

    if (!token) {
      setError("Token unfound. Please sign-in again.");
      setLoading(false);
      return;
    }

    if (announcementType === "book" && !bookTitle.trim()) {
      setError("Book title is required");
      setLoading(false);
      return;
    }

    if (!message.trim()) {
      setError("Message is required");
      setLoading(false);
      return;
    }

    try {
      let payload: any = {};

      if (announcementType === "book") {
        payload = {
          title: title?.trim() || `New Book: ${bookTitle.trim()}`,
          bookTitle: bookTitle.trim(),
          message: message.trim(),
        };
      } else {
        payload = {
          title: title.trim(),
          bookTitle: title.trim(),
          message: message.trim(),
        };
      }

      const res = await fetch(`${API_URL}/api/announcements`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `server responded ${res.status}`);
      }

      setSuccess("Announcement successfully sent to all users!");
      setTitle("");
      setBookTitle("");
      setMessage("");
      setAnnouncementType("general");

      try {
        onAnnouncementCreated();
      } catch {
        window.dispatchEvent(new CustomEvent("announcements:updated"));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send announcement.");
      console.error("QuickAnnouncementPanel error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border shadow-sm h-full" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>Quick Announcement</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Announcement Type</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAnnouncementType("general")} className="flex-1 py-2 px-4 rounded-lg font-medium transition-all" style={{ backgroundColor: announcementType === "general" ? colors.primary : colors.bgSecondary, color: announcementType === "general" ? "#ffffff" : colors.textSecondary, border: `2px solid ${announcementType === "general" ? colors.primary : colors.bgTertiary}` }}>📢 General</button>
            <button type="button" onClick={() => setAnnouncementType("book")} className="flex-1 py-2 px-4 rounded-lg font-medium transition-all" style={{ backgroundColor: announcementType === "book" ? colors.success : colors.bgSecondary, color: announcementType === "book" ? "#ffffff" : colors.textSecondary, border: `2px solid ${announcementType === "book" ? colors.success : colors.bgTertiary}` }}>📚 New Book</button>
          </div>
        </div>

        {announcementType === "book" ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Book Title <span style={{ color: colors.danger }}>*</span></label>
              <input name="bookTitle" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required placeholder="Misal: Norwegian Wood" className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all" style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Announcement Title <span style={{ color: colors.textSecondary, fontSize: "0.85em" }}>(optional)</span></label>
              <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Default: New Book: [Book Title]" className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all" style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Announcement Title <span style={{ color: colors.danger }}>*</span></label>
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="E.g.: The Library is Closed Tomorrow" className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all" style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }} />
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Message<span style={{ color: colors.danger }}>*</span></label>
          <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} placeholder={announcementType === "book" ? "Description about the new book..." : "Enter the announcement..."} className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-all resize-none" style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary, borderColor: colors.bgTertiary }} onFocus={(e) => { const color = announcementType === "book" ? colors.success : colors.primary; (e.currentTarget as HTMLTextAreaElement).style.borderColor = color; (e.currentTarget as HTMLTextAreaElement).style.boxShadow = `0 0 0 2px ${color}20`; }} onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = colors.bgTertiary; (e.currentTarget as HTMLTextAreaElement).style.boxShadow = "none"; }} />
        </div>

        {error && <p className="text-sm" style={{ color: colors.danger }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: colors.success }}>{success}</p>}

        <button type="submit" disabled={loading} className="w-full py-3 mt-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-white" style={{ backgroundColor: announcementType === "book" ? colors.success : colors.primary }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {loading ? "Sending..." : "Send to All Users"}
        </button>
      </form>
    </div>
  );
}
