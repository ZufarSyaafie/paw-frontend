"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, Edit, Plus, X } from "lucide-react";
import type { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const defaultFormState: Partial<Room> = {
  name: "",
  description: "",
  capacity: 1,
  price: 0,
  facilities: [],
  photos: [],
  status: "available",
};

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormState);
  
  const [facilitiesString, setFacilitiesString] = useState("");
  const [photosString, setPhotosString] = useState("");

  const token = getAuthToken();

  async function fetchRooms() {
    setIsLoading(true);
    const res = await fetch(`${API_URL}/api/rooms`);
    const data = await res.json();
    setRooms(data || []);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchRooms();
  }, []);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['capacity', 'price'].includes(name);
    setFormData({ 
      ...formData, 
      [name]: isNumberField ? Number(value) : value 
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing 
      ? `${API_URL}/api/rooms/${isEditing}`
      : `${API_URL}/api/rooms`;
    
    const splitRegex = /[\s,]+/; 
    
    const finalFormData = {
      ...formData,
      facilities: facilitiesString
        .split(splitRegex) 
        .map(f => f.trim())
        .filter(f => f),
      photos: photosString
        .split(splitRegex)
        .map(p => p.trim())
        .filter(p => p && p.startsWith("http")) // filter string kosong & pastiin itu URL
    };

    await fetch(endpoint, {
      method: method,
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(finalFormData)
    });

    closeModal();
    fetchRooms();
  };

  const openCreateModal = () => {
    setIsEditing(null);
    setFormData(defaultFormState);
    setFacilitiesString("");
    setPhotosString("");
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setIsEditing(room._id || room.id);
    setFormData(room);
    setFacilitiesString((room.facilities || []).join(', '));
    setPhotosString((room.photos || []).join(', '));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setFormData(defaultFormState);
  };

  if (isLoading && !showModal) {
    return <Loader2 className="w-8 h-8 animate-spin" />;
  }

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-5">{isEditing ? "Edit Ruangan" : "Tambah Ruangan Baru"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-medium">Nama Ruangan</label>
                <Input name="name" value={formData.name || ""} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <textarea name="description" value={formData.description || ""} onChange={handleFormChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="text-sm font-medium">Kapasitas</label>
                  <Input name="capacity" type="number" value={formData.capacity || 1} onChange={handleFormChange} required />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium">Harga/Jam</label>
                  <Input name="price" type="number" value={formData.price || 0} onChange={handleFormChange} />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleFormChange} 
                    className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Fasilitas (Pisahkan dgn koma/spasi/enter)</label>
                <textarea 
                  name="facilities" 
                  value={facilitiesString || ""} 
                  onChange={(e) => setFacilitiesString(e.target.value)} 
                  placeholder="Contoh: AC, Proyektor, Papan Tulis" 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Photo URLs (Pisahkan dgn koma/spasi/enter)</label>
                <textarea 
                  name="photos" 
                  value={photosString || ""} 
                  onChange={(e) => setPhotosString(e.target.value)} 
                  placeholder="https://.../img1.jpg, https://.../img2.jpg" 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Button type="submit" variant="primary" className="w-full !mt-6 !py-3">
                {isEditing ? "Simpan Perubahan" : "Simpan Ruangan"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Rooms</h1>
        <Button onClick={openCreateModal} variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Ruangan
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Nama Ruangan</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Kapasitas</th>
                <th className="text-left p-4 font-semibold">Harga/jam</th>
                <th className="text-left p-4 font-semibold">Fasilitas</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id || room.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 align-top">{room.name}</td>
                  <td className="p-4 align-top">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-4 align-top">{room.capacity}</td>
                  <td className="p-4 align-top">Rp {room.price?.toLocaleString('id-ID')}</td>
                  <td className="p-4 align-top text-sm text-slate-600">
                    {(room.facilities || []).join(', ')}
                  </td>
                  <td className="p-4 align-top flex gap-3">
                    <button onClick={() => openEditModal(room)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <Edit className="w-5 h-5" />
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