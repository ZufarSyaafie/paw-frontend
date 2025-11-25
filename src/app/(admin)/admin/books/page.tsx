"use client";

import React, { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loader2, Trash2, Edit, Plus, X } from "lucide-react";
import type { Book } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors } from "@/styles/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const defaultFormState: Partial<Book> = {
  title: "",
  author: "",
  stock: 1,
  category: "",
  year: new Date().getFullYear(),
  cover: "",
  synopsis: "",
  publisher: "",
  location: "",
  isbn: "",
  status: "available",
};

type BookWithBorrowed = Book & { borrowedCount?: number };

export default function ManageBooksPage(): React.JSX.Element {
  const [books, setBooks] = useState<BookWithBorrowed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Book>>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = getAuthToken();

  async function fetchBooks(showLoading = true) {
    try {
      if (showLoading) setIsLoading(true);
      
      const [booksRes, loansRes] = await Promise.all([
        fetch(`${API_URL}/api/books?limit=1000`), 
        fetch(`${API_URL}/api/loans`, { 
            headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const booksData = await booksRes.json();
      const loansData = await loansRes.json();
      
      const allBooks = Array.isArray(booksData) ? booksData : booksData.data || [];
      const allLoans = Array.isArray(loansData) ? loansData : loansData.data || [];

      // borrowed count
      const borrowedCounts: Record<string, number> = {};
      allLoans.forEach((loan: any) => {
        if (loan.status === 'borrowed' && loan.book) {
            const bookId = loan.book._id || loan.book.id || loan.book; 
            if (bookId) {
                borrowedCounts[bookId] = (borrowedCounts[bookId] || 0) + 1;
            }
        }
      });

      const mergedBooks = allBooks.map((book: any) => {
        const bId = book._id || book.id;
        return {
            ...book,
            borrowedCount: borrowedCounts[bId] || 0
        };
      });
      
      setBooks(mergedBooks);
    } catch (err) {
      console.error("fetchBooks error:", err);
      setBooks([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks(true)
    
    const onFocus = () => {
      fetchBooks(false)
    }
    window.addEventListener("focus", onFocus)

    const interval = setInterval(() => {
      fetchBooks(false)
    }, 5000)

    return () => {
      window.removeEventListener("focus", onFocus)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (bookId?: string) => {
    if (!bookId) return;
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    try {
      await fetch(`${API_URL}/api/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const isNumberField = ["stock", "year"].includes(name);
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isEditing) {
      const titleExists = books.some(
        book => book.title.toLowerCase().trim() === (formData.title || "").toLowerCase().trim()
      );
      if (titleExists) {
        setError(`Book with title "${formData.title}" already exists in the database.`);
        return;
      }
    }

    const finalFormData = { ...formData };

    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing
      ? `${API_URL}/api/books/${isEditing}`
      : `${API_URL}/api/books`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save book");
      }

      setSuccess(isEditing ? "Book successfully updated!" : "Book successfully added!");
      setTimeout(() => {
        closeModal();
        fetchBooks();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving book");
    }
  };

  const openCreateModal = () => {
    setIsEditing(null);
    setFormData(defaultFormState);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const openEditModal = (book: Book) => {
    setIsEditing(book._id ?? (book as any).id ?? null);
    setFormData(book);
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setFormData(defaultFormState);
    setError(null);
    setSuccess(null);
  };

  if (isLoading && !showModal) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      {showModal && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-lg relative border"
            style={{
              backgroundColor: colors.bgPrimary,
              borderColor: colors.bgTertiary,
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 transition-colors rounded-lg p-1 hover:opacity-80"
              style={{ color: colors.textSecondary }}
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-5" style={{ color: colors.textPrimary }}>
              {isEditing ? "Edit Book" : "Add New Book"}
            </h2>

            {error && (
              <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg border border-red-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-lg border border-green-300 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {/* Form Fields */}
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Title</label>
                <Input name="title" value={formData.title ?? ""} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Author</label>
                <Input name="author" value={formData.author ?? ""} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Stock</label>
                  <Input name="stock" type="number" value={String(formData.stock ?? 0)} onChange={handleFormChange} required className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Year</label>
                  <Input name="year" type="number" value={String(formData.year ?? new Date().getFullYear())} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Status</label>
                  <select 
                    name="status" 
                    value={(formData.stock as number) === 0 ? "unavailable" : formData.status ?? "available"} 
                    // value={formData.status ?? "available"}
                    onChange={handleFormChange} 
                    disabled={(formData.stock as number) === 0}
                    className="w-full h-[42px] px-4 py-2 rounded-lg focus:outline-none transition-all border disabled:opacity-50" 
                    style={{ 
                      backgroundColor: colors.bgSecondary,
                      color: colors.textPrimary,
                      borderColor: colors.bgTertiary,
                    }}
                    onFocus={(e: any) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
                    }}
                    onBlur={(e: any) => {
                      e.currentTarget.style.borderColor = colors.bgTertiary;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              
              <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Category</label>
                  <Input name="category" value={formData.category ?? ""} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
              </div>
              <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Publisher</label>
                  <Input name="publisher" value={formData.publisher ?? ""} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
              </div>
               <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>ISBN</label>
                   <Input name="isbn" value={formData.isbn ?? ""} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
                </div>
                <div className="flex-1">
                   <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Location</label>
                   <Input name="location" value={formData.location ?? ""} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
                </div>
              </div>
              <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Cover URL</label>
                  <Input name="cover" value={formData.cover ?? ""} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border" style={{ backgroundColor: colors.bgSecondary }} />
              </div>
               <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textPrimary }}>Synopsis</label>
                  <textarea name="synopsis" value={formData.synopsis ?? ""} onChange={handleFormChange} className="w-full h-24 px-4 py-2 rounded-lg border resize-none focus:outline-none" style={{ backgroundColor: colors.bgSecondary }} />
              </div>

              <Button type="submit" variant="primary" className="w-full !mt-6 !py-3 font-semibold text-white rounded-lg" style={{ backgroundColor: colors.primary }}>
                {isEditing ? "Save Changes" : "Add Book"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Manage Books</h1>
        <Button onClick={openCreateModal} variant="primary" 
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 font-semibold rounded-lg text-white transition-all hover:opacity-90" 
          style={{ backgroundColor: colors.primary }}>
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Add Book</span>
        </Button>
      </div>

      {/* mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {books.map((book) => {
             const key = book._id ?? (book as any).id;
             const stock = book.stock as number;
             const borrowed = book.borrowedCount ?? 0;
             
             // Logic Status
             let finalStatus: string = book.status;
             let statusLabel: string = book.status;
             if (stock === 0) {
                 if (borrowed > 0) {
                     finalStatus = 'out_of_stock';
                     statusLabel = 'Out of Stock';
                 } else {
                     finalStatus = 'unavailable';
                     statusLabel = 'Unavailable';
                 }
             }

             let bgStatus = `${colors.success}20`;
             let textStatus = colors.success;
             if (finalStatus === 'unavailable') {
                 bgStatus = `${colors.danger}20`;
                 textStatus = colors.danger;
             } else if (finalStatus === 'out_of_stock') {
                 bgStatus = `${colors.warning}20`;
                 textStatus = colors.warning;
             }

             return (
                <div 
                    key={key}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                             <img 
                                src={book.cover || "https://via.placeholder.com/150"} 
                                alt={book.title}
                                className="w-16 h-24 object-cover rounded border border-slate-100 shadow-sm flex-shrink-0"
                            />
                            <div>
                                <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm mb-1">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-slate-500 mb-2">{book.author}</p>
                                <span 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                    style={{ backgroundColor: bgStatus, color: textStatus }}
                                >
                                    {statusLabel}
                                </span>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <button onClick={() => openEditModal(book)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(key)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mt-1">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                            <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Stock</span>
                            <span className={`font-bold text-sm ${stock === 0 ? 'text-red-600' : 'text-slate-800'}`}>{stock}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                            <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Borrowed</span>
                            <span className={`font-bold text-sm ${borrowed > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{borrowed}</span>
                        </div>
                    </div>
                </div>
             );
        })}
      </div>

      {/* desktop */}
      <div className="hidden md:block rounded-lg border shadow-sm overflow-hidden" style={{ backgroundColor: colors.bgPrimary, borderColor: colors.bgTertiary }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.bgTertiary }}><tr>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}></th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Title</th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Author</th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Stock</th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Borrowed</th>
                <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>Status</th>
                <th className="text-center p-4 font-semibold" style={{ color: colors.textPrimary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const key = book._id ?? (book as any).id;
                const stock = book.stock as number;
                const borrowed = book.borrowedCount ?? 0;

                let finalStatus: string = book.status;
                let statusLabel: string = book.status;

                if (stock === 0) {
                    if (borrowed > 0) {
                        finalStatus = 'out_of_stock';
                        statusLabel = 'Out of Stock';
                    } else {
                        finalStatus = 'unavailable';
                        statusLabel = 'Unavailable';
                    }
                }

                let bgStatus = `${colors.success}20`;
                let textStatus = colors.success;

                if (finalStatus === 'unavailable') {
                    bgStatus = `${colors.danger}20`;
                    textStatus = colors.danger;
                } else if (finalStatus === 'out_of_stock') {
                    bgStatus = `${colors.warning}20`;
                    textStatus = colors.warning;
                }

                return (
                  <tr key={key} className="border-b transition-colors hover:opacity-80" style={{ borderColor: colors.bgTertiary, backgroundColor: colors.bgPrimary }}>
                    <td className="p-4 align-middle">
                        <img 
                            src={book.cover || "https://via.placeholder.com/150"} 
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow-sm border border-slate-100"
                        />
                    </td>
                    <td className="p-4 align-top" style={{ color: colors.textPrimary }}>{book.title}</td>
                    <td className="p-4 align-top" style={{ color: colors.textPrimary }}>{book.author}</td>
                    <td className="p-4 align-top font-semibold" style={{ color: stock === 0 ? colors.danger : colors.textPrimary }}>{stock}</td>
                    <td className="p-4 align-top font-semibold" style={{ color: borrowed > 0 ? colors.warning : colors.textSecondary }}>{borrowed}</td>
                    <td className="p-4 align-top">
                      <span 
                        className="px-3 py-1.5 rounded-full text-xs font-semibold inline-block capitalize" 
                        style={{ backgroundColor: bgStatus, color: textStatus }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 align-top text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openEditModal(book)} className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex" style={{ backgroundColor: `${colors.info}15`, color: colors.info }} title="Edit">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(key)} className="p-1.5 rounded-lg transition-colors hover:opacity-80 inline-flex" style={{ backgroundColor: `${colors.danger}15`, color: colors.danger }} title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}