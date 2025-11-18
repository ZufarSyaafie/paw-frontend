# Perpustakaan Naratama - Library Management System

A comprehensive digital library management system for Perpustakaan Naratama, built with Next.js 14, TypeScript, and Tailwind CSS. This application provides a complete solution for managing library operations including book lending, room bookings, user management, and more, specifically designed to meet the needs of Naratama Library members and staff.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14 App Router, TypeScript, and Tailwind CSS
- **Dual Dashboard System**: Separate interfaces for users and administrators
- **Authentication**: Secure sign-in/sign-up with OTP verification and password recovery
- **Book Management**: Browse, search, and borrow books with detailed information
- **Room Booking System**: Reserve study rooms with real-time availability
- **Loan Tracking**: Monitor borrowed books and loan history
- **Payment Processing**: Handle payment transactions for loans and bookings
- **Announcements**: Stay updated with library news and notifications
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager
- Git

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/ZufarSyaafie/paw-frontend.git
cd paw-frontend
```

> This is the frontend application for Perpustakaan Naratama

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create a `.env.local` file in the root directory and add your environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
paw-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # User dashboard pages
│   │   └── (admin)/           # Admin dashboard pages
│   ├── components/            # Reusable React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and store
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles and theme
├── public/                    # Static assets
└── ...config files
```

## 📄 Page Documentation

### Authentication Pages (`/app/(auth)`)

#### Sign In (`/sign-in`)

- **Purpose**: User authentication and login
- **Features**:
  - Email/password login
  - Google OAuth integration
  - Remember me functionality
  - Link to sign-up and password recovery

#### Sign Up (`/sign-up`)

- **Purpose**: New user registration
- **Features**:
  - User account creation
  - Email verification
  - Google OAuth registration
  - Input validation and error handling

#### OTP Verification (`/otp`)

- **Purpose**: Email verification via one-time password
- **Features**:
  - 6-digit OTP input
  - Resend OTP functionality
  - Auto-submit on completion
  - Timer countdown

#### Forgot Password (`/forgot-password`)

- **Purpose**: Password recovery for users
- **Features**:
  - Email verification
  - Password reset link generation
  - Security validation

---

### User Dashboard Pages (`/app/(dashboard)`)

#### Dashboard Home (`/dashboard`)

- **Purpose**: Main user dashboard and overview for Perpustakaan Naratama members
- **Features**:
  - Quick access to all library features
  - Recent activities summary
  - Active loans display
  - Upcoming room bookings
  - Latest library announcements from Perpustakaan Naratama

#### Books (`/books`)

- **Purpose**: Browse and search available books
- **Features**:
  - Book catalog with search and filters
  - Category filtering
  - Availability status
  - Detailed book information
  - Add to wishlist functionality

#### Book Detail (`/books/[id]`)

- **Purpose**: Detailed information about a specific book
- **Features**:
  - Complete book information (title, author, ISBN, etc.)
  - Availability status
  - Borrow button
  - Related books suggestions
  - User reviews and ratings

#### Loans (`/loans`)

- **Purpose**: View and manage borrowed books
- **Features**:
  - Active loans list
  - Loan history
  - Due date tracking
  - Return book functionality
  - Overdue notifications

#### Loan Detail (`/loans/[id]`)

- **Purpose**: Detailed information about a specific loan
- **Features**:
  - Loan details (book info, dates, status)
  - Return instructions
  - Fine calculation (if applicable)
  - Transaction history

#### Rooms (`/rooms`)

- **Purpose**: Browse and book study rooms
- **Features**:
  - Available rooms display
  - Room specifications (capacity, facilities)
  - Real-time availability
  - Booking interface

#### Room Detail (`/rooms/[id]`)

- **Purpose**: Detailed information about a specific room
- **Features**:
  - Room details and photos
  - Facility list
  - Capacity information
  - Booking calendar
  - Time slot selection

#### Bookings (`/bookings`)

- **Purpose**: Manage room bookings
- **Features**:
  - Active bookings list
  - Booking history
  - Cancellation functionality
  - Booking status tracking

#### Booking Detail (`/bookings/[id]`)

- **Purpose**: Detailed information about a specific booking
- **Features**:
  - Booking details (room, date, time)
  - QR code for check-in
  - Cancellation option
  - Modification functionality

#### Payments (`/payments`)

- **Purpose**: Handle payment transactions
- **Features**:
  - Payment history
  - Pending payments list
  - Payment status tracking
  - Invoice generation
  - Multiple payment methods

#### Announcements (`/announcements`)

- **Purpose**: View Perpustakaan Naratama announcements and news
- **Features**:
  - Latest announcements list from library staff
  - Categories filtering (events, closures, new books, etc.)
  - Read/unread status
  - Notification preferences

#### Announcement Detail (`/announcements/[id]`)

- **Purpose**: Full content of a specific announcement
- **Features**:
  - Complete announcement text
  - Attachments (if any)
  - Publishing date
  - Related announcements

#### Profile (`/profile`)

- **Purpose**: User profile management
- **Features**:
  - View and edit profile information
  - Change password
  - Upload profile picture
  - Notification settings
  - Account statistics

---

### Admin Dashboard Pages (`/app/(admin)`)

#### Admin Dashboard (`/admin/dashboard`)

- **Purpose**: Administrative overview and statistics for Perpustakaan Naratama staff
- **Features**:
  - System statistics (total members, books, active loans)
  - Recent activities across the library
  - Analytics charts and insights
  - Quick action buttons for common tasks
  - Library performance metrics

#### User Management (`/admin/users`)

- **Purpose**: Manage Perpustakaan Naratama members and users
- **Features**:
  - Complete member list with search and filters
  - Add/edit/delete member accounts
  - User roles and permissions (member, staff, admin)
  - Account status management (active, suspended, expired)
  - Member activity logs

#### Book Management (`/admin/books`)

- **Purpose**: Manage library book inventory
- **Features**:
  - Book catalog management
  - Add/edit/delete books
  - Stock management
  - Category management
  - Import/export functionality

#### Loan Management (`/admin/loans`)

- **Purpose**: Oversee all book loans
- **Features**:
  - All loans overview
  - Approve/reject loan requests
  - Process returns
  - Fine management
  - Generate loan reports

#### Room Management (`/admin/rooms`)

- **Purpose**: Manage study rooms
- **Features**:
  - Room inventory
  - Add/edit/delete rooms
  - Set room availability
  - Maintenance scheduling
  - Capacity management

#### Booking Management (`/admin/bookings`)

- **Purpose**: Oversee room bookings
- **Features**:
  - All bookings overview
  - Approve/reject booking requests
  - Booking calendar view
  - Conflict resolution
  - Generate booking reports

#### Announcement Management (`/admin/announcements`)

- **Purpose**: Create and manage announcements
- **Features**:
  - Create new announcements
  - Edit/delete announcements
  - Schedule publishing
  - Target audience selection
  - Attachment management

---

## 🎨 Design System

The application uses a consistent design system with:

- **Colors**: Defined in `src/styles/colors.ts`
- **Typography**: Defined in `src/styles/typography.ts`
- **Spacing**: Defined in `src/styles/spacing.ts`
- **Components**: Reusable UI components in `src/components/ui/`

## 🔧 Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Custom components with shadcn/ui
- **Authentication**: Custom auth with JWT
- **API Integration**: Custom hooks with Axios
- **Forms**: React Hook Form with Zod validation

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the PAW Frontend Team for Perpustakaan Naratama

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

**Note**: This project is the frontend application for Perpustakaan Naratama's digital library management system. Make sure to set up the backend API before running the frontend application.

## 🏛️ About Perpustakaan Naratama

Perpustakaan Naratama is committed to providing excellent library services to its members. This digital platform aims to enhance the library experience by offering convenient online access to:

- Browse and borrow books from our extensive collection
- Reserve study rooms for individual or group study sessions
- Manage loans and track borrowing history
- Stay updated with library news and events
- Process payments seamlessly

Our goal is to create a modern, user-friendly digital library experience that complements our physical library services.
