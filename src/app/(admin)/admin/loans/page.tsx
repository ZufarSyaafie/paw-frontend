"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, CheckCircle, Clock, RotateCcw, Search } from "lucide-react";
import type { Loan } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusConfig = {
  borrowed: { color: 'text-amber-800', icon: Clock, label: 'Borrowed' },
  returned: { color: 'text-green-800', icon: CheckCircle, label: 'Returned' },
};

export default function ManageLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const token = getAuthToken();

  async function fetchLoans() {
    setIsLoading(true);
    const res = await fetch(`${API_URL}/api/loans`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setLoans(data || []);
    } else {
      setLoans([]);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (token) {
      fetchLoans();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleReturn = async (loanId: string) => {
    if (!confirm("Yakin mau 'Force Return' buku ini?")) return;
    
    await fetch(`${API_URL}/api/loans/${loanId}/return`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchLoans(); // Refresh list
  };

  const filteredLoans = useMemo(() => {
    return loans
      .filter(l => {
        if (filter === 'all') return true;
        return l.status === filter;
      })
      .filter(l => {
        const query = search.toLowerCase();
        if (!query) return true;
        return (
          (l.book?.title || '').toLowerCase().includes(query) ||
          (l.user?.email || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }, [loans, filter, search]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Loans</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Cari nama buku atau email user..." 
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'borrowed', 'returned'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Buku</th>
                <th className="text-left p-4 font-semibold">User (Email)</th>
                <th className="text-left p-4 font-semibold">Tanggal Pinjam</th>
                <th className="text-left p-4 font-semibold">Jatuh Tempo</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => {
                  const statusInfo = statusConfig[loan.status] || statusConfig.borrowed;
                  const isOverdue = loan.status === 'borrowed' && loan.dueDate && new Date(loan.dueDate) < new Date();
                  return (
                    <tr key={loan._id || loan.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 align-top">{loan.book?.title || 'Buku Dihapus'}</td>
                      <td className="p-4 align-top text-sm">{loan.user?.email || 'User Dihapus'}</td>
                      <td className="p-4 align-top">{formatDate(loan.borrowDate)}</td>
                      <td className={`p-4 align-top ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                        {formatDate(loan.dueDate)}
                        {isOverdue && <span className="text-xs block"> (OVERDUE)</span>}
                      </td>
                      <td className="p-4 align-top">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusInfo.color}`}>
                          <statusInfo.icon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        {loan.status === 'borrowed' && (
                          <button 
                            onClick={() => handleReturn(loan._id || loan.id)} 
                            className="text-blue-600 hover:text-blue-800" 
                            title="Force Return"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    Tidak ada data pinjaman yang cocok.
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