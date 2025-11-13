// User Types
export interface User {
  id: string
  _id?: string
  username: string
  name?: string
  email: string
  password?: string
  role: "admin" | "user"
  isVerified: boolean
  profilePicture: string
  joinDate: string
  createdAt?: string
  bio?: string
  phone?: string
}

// Book Types
export interface Book {
  id: string
  _id?: string
  title: string
  author: string
  cover?: string 
  stock: number
  status: "available" | "unavailable"
  isbn?: string
  category: string
  year: number
  description?: string
  synopsis?: string 
  location?: string
  publisher?: string
}

export interface BookDetail extends Book {

}

// Room Types
export interface Room {
  id: string
  _id?: string
  name: string
  description?: string 
  capacity: number
  image?: string
  photos: string[] 
  features?: string[]
  facilities: string[]
  status: "available" | "booked" | "maintenance"
  price: number
}

export interface RoomDetail extends Room {

}

// Booking Types
export interface Booking {
    id: string
    _id?: string
    user: { id: string, name: string, email: string }
    room: { id: string, name: string, capacity: number, image: string }
    date: string
    features?: string[] 
    startTime: string
    endTime: string
    durationHours: number
    totalPrice: number
    status: 'confirmed' | 'pending_payment' | 'cancelled'
    paymentStatus: 'unpaid' | 'paid' | 'failed'
    phone: string 
    midtransOrderId?: string
    createdAt: string
    updatedAt: string
    displayStatus?: string 
}

// Loan Types
export interface Loan {
  id: string
  _id?: string
  user: { id: string, email: string }
  book: { id: string, title: string, author: string, cover: string, image: string, synopsis?: string } 
  borrowDate: string
  dueDate: string
  returnDate?: string | undefined
  status: 'borrowed' | 'returned'
  midtransOrderId?: string
  depositAmount: number
  paymentStatus: 'unpaid' | 'paid' | 'failed'
  refundStatus: 'pending' | 'refunded' | 'forfeited'
  createdAt: string
}

export type FrontendLoan = Loan & { status: 'borrowed' | 'returned' | 'overdue' };

// Payment Types
export interface Payment {
  id: string
  _id?: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  description?: string
  transactionId?: string
  type?: string
  createdAt: string
}

// Announcement Types
export interface Announcement {
  id: number | string
  _id?: string
  title?: string
  snippet?: string
  bookTitle: string
  message: string
  fullContent?: string
  date?: string
  createdAt: string
}

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
  _id?: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  borrowDate: string
  dueDate: string
  status: "active" | "returned" | "overdue"
}
export interface RoomBooking {
  id: string
  _id?: string
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