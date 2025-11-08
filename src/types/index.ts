// User Types
export interface User {
  id: string
  username: string
  email: string
  profilePicture: string
  joinDate: string
  bio?: string
}

// Book Types
export interface Book {
  id: string
  title: string
  author: string
  cover: string
  stock: number
  status: "available" | "rented" | "unavailable"
  isbn: string
  category: string
  year: number
  description: string
}

export interface BookDetail extends Book {
  longDescription: string
  publisher: string
  pages: number
}

// Room Types
export interface Room {
  id: string
  name: string
  description: string
  capacity: number
  image: string
  features: string[]
  status: "available" | "booked"
}

export interface RoomDetail extends Room {
  longDescription: string
  pricePerHour: number
  availableSlots: string[]
}

// Booking Types
export interface Booking {
    id: string
    roomId: string
    roomName: string
    userId: string
    userName: string
    startDate: string
    endDate: string
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    notes?: string
    createdAt: string
    updatedAt: string
}

// Loan Types
export interface Loan {
  id: string
  bookId: string
  userId: string
  borrowDate: string
  dueDate: string
  returnDate?: string | undefined
  status: 'active' | 'returned' | 'overdue'
  createdAt: string
}

// Payment Types
export interface Payment {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  description?: string
  transactionId?: string  // ← Add this
  type?: string           // ← Add this (untuk payment type)
  createdAt: string
}

// Announcement Types
export interface Announcement {
  id: number
  title: string
  snippet: string
  fullContent: string
  date: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface BookBorrow {
  id: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  borrowDate: string
  dueDate: string
  status: "active" | "returned" | "overdue"
}

export interface RoomBooking {
  id: string
  roomId: string
  roomName: string
  bookingDate: string
  timeSlot: string
  status: "upcoming" | "completed" | "cancelled"
}

export interface UserActivity {
  borrowedBooks: BookBorrow[]
  roomBookings: RoomBooking[]
}