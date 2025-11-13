"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, Trash2, Plus, X } from "lucide-react";
import type { User } from "@/types"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserFormData {
  name: string;
  email: string;
  password?: string; // Password opsional kalo create
  role: "user" | "admin";
}

const defaultFormState: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(defaultFormState);
  const [error, setError] = useState<string | null>(null);

  const token = getAuthToken();

  async function fetchUsers() {
    setIsLoading(true);
    const res = await fetch(`${API_URL}/api/users`, { 
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data || []);
    } else {
        console.error("Gagal fetch users:", res.statusText);
        setUsers([]);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Yakin mau hapus user ini? Ini gak bisa di-undo.")) return;
    
    await fetch(`${API_URL}/api/users/${userId}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchUsers(); 
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.password || formData.password.length < 6) {
        setError("Password wajib diisi, minimal 6 karakter.");
        return;
    }

    const res = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Gagal membuat user.");
    } else {
        closeModal();
        fetchUsers(); // Refresh list
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(defaultFormState);
    setError(null);
  };

  if (isLoading && !showModal) {
    return <Loader2 className="w-8 h-8 animate-spin" />;
  }

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-5">Tambah User Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input name="name" value={formData.name} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" value={formData.email} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="text-sm font-medium">Password (Minimal 6 karakter)</label>
                <Input name="password" type="password" value={formData.password} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleFormChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <Button type="submit" variant="primary" className="w-full !mt-6 !py-3">
                Simpan User
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">  
            <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 border-b">
                <tr>
                <th className="text-left p-4 font-semibold">Nama</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                <tr key={user._id || user.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {user.role.toUpperCase()}
                    </span>
                    </td>
                    <td className="p-4">
                    <button 
                        onClick={() => handleDelete(user._id || user.id)} 
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                        title="Delete"
                        // Logika simpel: jangan biarin admin ngehapus diri sendiri
                        disabled={user.email.includes('main_admin')} // 'main_admin' kalo tar ada email admin utama
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}