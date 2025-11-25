"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Mail, Calendar, BookOpen, Users, Loader2, AlertCircle, Phone, KeyRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"
import type { User as UserType, FrontendLoan, Booking } from "@/types"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const STATUS_COLORS: Record<string, string> = {
    borrowed: "bg-cyan-50 text-cyan-700",
    upcoming: "bg-emerald-50 text-emerald-700",
    returned: "bg-slate-100 text-slate-600",
    completed: "bg-slate-100 text-slate-600",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-red-50 text-red-700",
    pending_payment: "bg-amber-50 text-amber-700", 
}

const STATUS_LABELS: Record<string, string> = {
    borrowed: "Borrowed",
    returned: "Returned",
    overdue: "Overdue",
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
    pending_payment: "Pending Payment",
}

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<"overview" | "books" | "rooms">("overview")

    const [userData, setUserData] = useState<UserType | null>(null)
    const [userActivity, setUserActivity] = useState<{ loans: FrontendLoan[], bookings: Booking[] }>({ loans: [], bookings: [] })
    
    const [editedUsername, setEditedUsername] = useState("")
    const [editedEmail, setEditedEmail] = useState("") 
    const [editedBio, setEditedBio] = useState("")
    const [editedPhone, setEditedPhone] = useState("")

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const token = getAuthToken()
        if (!token) {
            setError("Authentication token not found.")
            setIsLoading(false)
            return
        }

        let cancelled = false

        const fetchUserData = async (showLoading = true) => {
            if (showLoading) setIsLoading(true)
            
            try {
                const userRes = await fetch(`${API_URL}/api/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                if (!userRes.ok) throw new Error("Failed to fetch user data.")
                
                const userJson = await userRes.json() as UserType
                
                const userData = {
                    ...userJson,
                    username: userJson.name || userJson.username,
                    joinDate: userJson.createdAt || new Date().toISOString(),
                    profilePicture: userJson.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=user_default"
                }

                if (!cancelled) {
                    setUserData(userData)
                    if (!isEditing) {
                        setEditedUsername(userData.username)
                        setEditedEmail(userData.email) 
                        setEditedBio(userData.bio || "")
                        setEditedPhone(userData.phone || "")
                    }
                    localStorage.setItem('userProfilePicture', userData.profilePicture);
                }

                const loansRes = await fetch(`${API_URL}/api/loans/my`, {
                     headers: { "Authorization": `Bearer ${token}` }
                })
                const loansData = await loansRes.json() || []

                const bookingsRes = await fetch(`${API_URL}/api/rooms/bookings/list`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const bookingsData = await bookingsRes.json() || []

                const processedLoans = loansData.map((loan: any) => {
                    let status = loan.status;
                    if (loan.paymentStatus === 'unpaid') {
                        status = 'pending_payment'; 
                    } else {
                        const isOverdue = status === 'borrowed' && new Date(loan.dueDate) < new Date();
                        if (isOverdue) status = "overdue";
                    }
                    return { ...loan, status: status } as FrontendLoan;
                });

                const processedBookings = bookingsData
                    .filter((b: Booking) => b.status !== "cancelled")
                    .map((b: Booking) => ({
                        ...b,
                        displayStatus: b.status === "confirmed" ? "completed" : "pending_payment" 
                    }));

                if (!cancelled) {
                    setUserActivity({ loans: processedLoans, bookings: processedBookings })
                }

            } catch (err: any) {
                console.error(err)
                if (!cancelled && showLoading) setError(err.message || "Failed to load profile data.")
            } finally {
                if (!cancelled && showLoading) setIsLoading(false)
            }
        }

        fetchUserData(true)

        const onFocus = () => fetchUserData(false)
        window.addEventListener("focus", onFocus)

        const interval = setInterval(() => fetchUserData(false), 5000)

        return () => {
            cancelled = true
            window.removeEventListener("focus", onFocus)
            clearInterval(interval)
        }
    }, [isEditing]) 

    const handleProfilePictureClick = () => {
        const choice = window.confirm("Choose 'OK' to upload a file (temporary), or 'Cancel' to enter an image URL.");
        if (choice) {
            fileInputRef.current?.click();
        } else {
            const newImageUrl = window.prompt("Enter an online image URL (e.g., https://i.imgur.com/...jpg):");
            if (newImageUrl && newImageUrl.startsWith("http")) {
                handleSaveProfilePictureUrl(newImageUrl);
            } else if (newImageUrl) {
                alert("Invalid URL. It must start with 'http'.");
            }
        }
    }

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
           const file = e.target.files?.[0]
           if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const tempUrl = reader.result as string;
                setUserData({ ...userData!, profilePicture: tempUrl })
                localStorage.setItem('userProfilePicture', tempUrl);
                window.dispatchEvent(new Event('storage')); 
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveProfilePictureUrl = async (newUrl: string) => {
        setIsSaving(true);
        setFormError(null);
        const token = getAuthToken();

        try {
            const response = await fetch(`${API_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    profilePicture: newUrl 
                })
            });
            const updatedUser = await response.json();
            if (!response.ok) throw new Error(updatedUser.message);

            setUserData({ ...userData!, profilePicture: updatedUser.profilePicture });
            localStorage.setItem('userProfilePicture', updatedUser.profilePicture);
            window.dispatchEvent(new Event('storage'));
            alert("Profile photo updated successfully!");

        } catch (err: any) {
            alert(`Failed to update profile photo: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    }

    const handleSaveProfile = async () => {
        if (!window.confirm("Are you sure you want to save these changes?")) return;

        setIsSaving(true);
        setFormError(null);
        const token = getAuthToken();
        const oldEmail = userData?.email;

        try {
            const response = await fetch(`${API_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: editedUsername, 
                    email: editedEmail, 
                    bio: editedBio,
                    phone: editedPhone, 
                    profilePicture: userData!.profilePicture 
                })
            });

            const updatedUser = await response.json();
            if (!response.ok) {
                throw new Error(updatedUser.message || "Failed to save profile.");
            }

            setUserData({ 
                ...userData!, 
                username: updatedUser.name, 
                bio: updatedUser.bio,
                email: updatedUser.email,
                phone: updatedUser.phone, 
                isVerified: updatedUser.isVerified,
                profilePicture: updatedUser.profilePicture
            });

            localStorage.setItem('userProfilePicture', updatedUser.profilePicture);
            window.dispatchEvent(new Event('storage'));
            
            if (oldEmail !== updatedUser.email && !updatedUser.isVerified) {
                alert("Profile updated! Your email has been changed and is now UNVERIFIED. Please verify your new email.");
            } else {
                alert("Profile updated successfully!");
            }
            
            setIsEditing(false);
        } catch (err: any) {
            setFormError(err.message || "An error occurred.");
            alert(err.message || "An error occurred.");
        } finally {
            setIsSaving(false);
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormError(null);
        setEditedUsername(userData!.username)
        setEditedEmail(userData!.email) 
        setEditedBio(userData!.bio || "")
        setEditedPhone(userData!.phone || "")
    }

    const initiateChangePassword = async () => {
        if (!confirm("We will send an OTP to your email to verify a password change. Continue?")) return;
        
        setIsSendingOtp(true);
        setPasswordError("");

        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData?.email })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP");

            setShowPasswordModal(true);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSendingOtp(false);
        }
    }

    const submitNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingOtp(true);
        setPasswordError("");

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userData?.email,
                    otp,
                    newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to reset password");

            alert("Password changed successfully!");
            setShowPasswordModal(false);
            setOtp("");
            setNewPassword("");
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsSendingOtp(false);
        }
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

    const isChanged = userData 
        ? userData.username !== editedUsername || 
          userData.email !== editedEmail || 
          (userData.bio || "") !== editedBio ||
          (userData.phone || "") !== editedPhone
        : false;

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="ml-3 text-gray-600 font-medium">Loading profile...</p>
        </div>
    )

    if (error || !userData) return (
         <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
            <p className="text-sm text-red-700">{error || "User data not found."}</p>
        </div>
    )

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
            
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter the OTP sent to <b>{userData.email}</b> and your new password.
                        </p>

                        <form onSubmit={submitNewPassword} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">OTP Code</label>
                                <input 
                                    type="text" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="123456"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="Min. 6 characters"
                                    minLength={6}
                                    required
                                />
                            </div>

                            {passwordError && (
                                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{passwordError}</p>
                            )}

                            <Button 
                                type="submit" 
                                disabled={isSendingOtp}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                                {isSendingOtp ? "Processing..." : "Reset Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 shadow-sm">
                             {/* Profile Picture */}
                             <div className="text-center">
                                <div className="relative inline-block">
                                     <img
                                         src={userData.profilePicture}
                                         alt={userData.username}
                                         className="w-32 h-32 rounded-full border-4"
                                        style={{ borderColor: colors.primary }}
                                    />
                                     <button
                                         onClick={handleProfilePictureClick} 
                                          className="absolute bottom-0 right-0 p-2 rounded-full text-white hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: colors.primary }}
                                     >
                                         <Camera className="w-5 h-5" />
                                     </button>
                                 </div>
                                <input
                                      ref={fileInputRef}
                                     type="file"
                                    accept="image/*"
                                      onChange={handleProfilePictureChange}
                                     className="hidden"
                                />
                            </div>

                             {/* User Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                         Name
                                     </p>
                                     {isEditing ? (
                                        <input
                                            type="text"
                                             value={editedUsername}
                                            onChange={(e) => setEditedUsername(e.target.value)}
                                             className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                            style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                         />
                                    ) : (
                                        <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                              {userData.username}
                                        </p>
                                     )}
                                </div>

                                  <div>
                                     {isEditing ? (
                                        <>
                                            <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                                Email
                                            </p>
                                             <input
                                                type="email"
                                                value={editedEmail}
                                                onChange={(e) => setEditedEmail(e.target.value)}
                                                 className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                                style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                             />
                                        </>
                                      ) : (
                                        <InfoField 
                                            icon={<Mail className="w-4 h-4 flex-shrink-0" />} 
                                            label="Email" 
                                            value={
                                              <div className="flex items-center gap-2 min-w-0">
                                                    <span className="truncate" title={userData.email}>{userData.email}</span>
                                                     {!userData.isVerified && (
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700 flex-shrink-0">
                                                            Unverified
                                                       </span>
                                                    )}
                                                </div>
                                            } 
                                        />
                                     )}
                                </div>
                                
                                <div>
                                     {isEditing ? (
                                        <>
                                            <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                                Phone Number
                                            </p>
                                             <input
                                                type="tel"
                                                value={editedPhone}
                                                onChange={(e) => setEditedPhone(e.target.value)}
                                                 placeholder="0812..."
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                                 style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                            />
                                         </>
                                     ) : (
                                        <InfoField 
                                             icon={<Phone className="w-4 h-4" />} 
                                            label="Phone" 
                                            value={userData.phone || "No phone added yet"} 
                                        />
                                     )}
                                 </div>

                                 <InfoField
                                    icon={<Calendar className="w-4 h-4" />}
                                     label="Member Since"
                                    value={formatDate(userData.joinDate)}
                                />

                                 <div>
                                    <p className={`${typography.labelSmall} uppercase mb-2`} style={{ color: colors.textSecondary }}>
                                         Bio
                                    </p>
                                    {isEditing ? (
                                        <textarea
                                            value={editedBio}
                                             onChange={(e) => setEditedBio(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 resize-none"
                                             style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                                            rows={3}
                                             placeholder="Tell us a bit about yourself..." 
                                         />
                                    ) : (
                                        <p className={typography.bodySmall} style={{ color: colors.textSecondary }}>
                                              {userData.bio || "No bio added yet"}
                                         </p>
                                     )}
                                </div>
                                
                                {formError && (
                                    <p className="text-sm text-red-600">{formError}</p>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-200">
                                {isEditing ? (
                                    <>
                                        <Button
                                             onClick={handleSaveProfile}
                                            variant="success" 
                                             className="w-full"
                                            disabled={isSaving || !isChanged} 
                                        >
                                           {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                         <Button
                                             onClick={handleCancel}
                                              variant="secondary"
                                            className="w-full"
                                              disabled={isSaving}
                                         >
                                            Cancel
                                         </Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Button
                                             onClick={() => setIsEditing(true)}
                                             variant="primary"
                                             className="w-full"
                                         >
                                            Edit Profile
                                        </Button>
                                        
                                        <Button
                                            onClick={initiateChangePassword}
                                            variant="outline"
                                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                                        >
                                            <KeyRound className="w-4 h-4" /> Change Password
                                        </Button>
                                    </div>
                                )}
                            </div>
                         </div>
                     </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                             {/* Tabs */}
                             <div className="flex border-b border-slate-200">
                                {[
                                    { id: "overview", label: "Overview" },
                                     { id: "books", label: "Books", icon: BookOpen, count: userActivity.loans.length },
                                    { id: "rooms", label: "Rooms", icon: Users, count: userActivity.bookings.length },
                                 ].map((tab) => (
                                    <TabButton
                                        key={tab.id}
                                         isActive={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id as "overview" | "books" | "rooms")}
                                        icon={tab.icon}
                                        label={tab.label}
                                         count={tab.count}
                                    />
                                ))}
                              </div>
                            {/* Konten Tab */}
                            <div className="p-6">
                                 {activeTab === "overview" && <OverviewTab activity={userActivity} />}
                                {activeTab === "books" && <BooksTab books={userActivity.loans} />}
                                {activeTab === "rooms" && <RoomsTab bookings={userActivity.bookings} />} 
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
    )
}

function TabButton({
    isActive,
    onClick,
    icon: Icon,
    label,
    count,
}: {
    isActive: boolean
    onClick: () => void
    icon?: any
    label: string
    count?: number
}) {
    return (
        <button
            onClick={onClick}
            className="flex-1 px-4 py-3 font-semibold border-b-2 transition-colors flex items-center justify-center gap-2"
            style={{
                backgroundColor: isActive ? colors.info : "transparent",
                color: isActive ? "white" : colors.textSecondary,
                borderBottomColor: isActive ? colors.info : "transparent",
            }}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            {count !== undefined && ` (${count})`}
        </button>
    )
}

function InfoField({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode 
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span style={{ color: colors.textSecondary }}>{icon}</span>
                <p className={`${typography.labelSmall} uppercase`} style={{ color: colors.textSecondary }}>
                      {label}
                </p>
            </div>
            <div className={`${typography.body} break-all`} style={{ color: colors.textPrimary }}>
                {value}
            </div>
        </div>
    )
}

function OverviewTab({ activity }: { activity: { loans: FrontendLoan[], bookings: Booking[] } }) {
    const allItems = [
        ...activity.loans.map(loan => {
            const rawDate = loan.createdAt || loan.borrowDate;
            const timestamp = rawDate ? new Date(rawDate).getTime() : Date.now();
            return {
                type: 'loan',
                date: isNaN(timestamp) ? Date.now() : timestamp,
                data: loan
            };
        }),
        ...activity.bookings.map(booking => {
            const rawDate = booking.createdAt || booking.date;
            const timestamp = rawDate ? new Date(rawDate).getTime() : Date.now();
            return {
                type: 'booking',
                date: isNaN(timestamp) ? Date.now() : timestamp,
                data: booking
            };
        })
    ];

    const sortedItems = allItems.sort((a, b) => b.date - a.date);
    const recentActivity = sortedItems.slice(0, 5);

    const booksCount = activity.loans.filter(l => l.paymentStatus === 'paid').length;
    const roomsCount = activity.bookings.filter(b => b.status === 'confirmed' || (b as any).displayStatus === 'completed').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatBox label="Books Borrowed" value={booksCount} />
                <StatBox label="Room Bookings" value={roomsCount} />
            </div>

            <div>
                <h3 className={`${typography.h4} mb-3`} style={{ color: colors.textPrimary }}>
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((item, idx) => {
                            const dateStr = new Date(item.date).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric'
                            });

                            if (item.type === 'loan') {
                                const loan = item.data as FrontendLoan;
                                return (
                                    <ActivityCard
                                        key={`loan-${idx}`}
                                        title={loan.book.title}
                                        subtitle={`Book Loan • ${dateStr}`}
                                        status={loan.status}
                                    />
                                );
                            } else {
                                const booking = item.data as Booking;
                                return (
                                    <ActivityCard
                                        key={`booking-${idx}`}
                                        title={booking.room.name}
                                        subtitle={`Room Booking • ${dateStr}`}
                                        status={booking.displayStatus || booking.status} 
                                    />
                                );
                            }
                        })
                    ) : (
                        <p className="text-gray-500 text-sm italic">No recent activity found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function BooksTab({ books }: { books: FrontendLoan[] }) {
    return (
        <div className="space-y-3">
            {books.map((loan) => {
                const returnDate = loan.returnDate || (loan as any).returnedAt;
                const isReturned = loan.status === 'returned';

                let borrowDateObj = new Date(loan.borrowDate);
                if (isNaN(borrowDateObj.getTime()) && loan.dueDate) {
                     const due = new Date(loan.dueDate);
                     borrowDateObj = new Date(due.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                
                const displayBorrowDate = !isNaN(borrowDateObj.getTime())
                    ? borrowDateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "N/A";

                let rightLabel = "Due Date";
                let rightValueString = loan.dueDate;
                let rightColor = (loan.status as string) === "overdue" ? colors.danger : colors.textPrimary;
                let rightWeight = "normal";

                if (isReturned && returnDate) {
                    rightLabel = "Returned Date";
                    rightValueString = returnDate;
                    rightColor = colors.success;
                    rightWeight = "600";
                }

                const displayRightDate = rightValueString
                    ? new Date(rightValueString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "N/A";

                return (
                    <div
                        key={(loan.id || loan._id) as string}
                        className="rounded-lg border border-slate-200 p-4"
                        style={{ backgroundColor: colors.bgSecondary }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                    {loan.book.title}
                                </p>
                                <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                    by {loan.book.author}
                                </p>
                            </div>
                            <StatusBadge status={loan.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                    Borrow Date
                                </p>
                                <p className={typography.body} style={{ color: colors.textPrimary }}>
                                    {displayBorrowDate}
                                </p>
                            </div>
                            <div>
                                <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                                    {rightLabel}
                                </p>
                                <p className={typography.body} style={{ color: rightColor, fontWeight: rightWeight }}>
                                    {displayRightDate}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function RoomsTab({ bookings }: { bookings: Booking[] }) {
    return (
        <div className="space-y-3">
            {bookings.map((booking) => (
                 <div
                    key={(booking.id || booking._id) as string}
                    className="rounded-lg border border-slate-200 p-4"
                     style={{ backgroundColor: colors.bgSecondary }}
                >
                     <div className="flex items-start justify-between mb-3">
                        <div>
                             <p className={typography.h4} style={{ color: colors.textPrimary }}>
                                {booking.room.name}
                             </p>
                            <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                                {booking.startTime} - {booking.endTime}
                             </p>
                        </div>
                         <StatusBadge status={booking.displayStatus || booking.status} /> 
                    </div>
                    <div>
                        <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                             Booking Date
                        </p>
                        <p className={typography.body} style={{ color: colors.textPrimary }}>
                            {new Date(booking.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-slate-200 p-4" style={{ backgroundColor: colors.bgSecondary }}>
            <p className={typography.labelSmall} style={{ color: colors.textSecondary }}>
                {label}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: colors.info }}>
                {value}
            </p>
        </div>
    )
}

function ActivityCard({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
    return (
        <div
            className="rounded-lg border border-slate-200 p-3 flex items-start justify-between"
            style={{ backgroundColor: colors.bgSecondary }}
        >
            <div>
                <p className={typography.body} style={{ color: colors.textPrimary }}>
                     {title}
                </p>
                <p className={`${typography.bodySmall} mt-1`} style={{ color: colors.textSecondary }}>
                    {subtitle}
                </p>
            </div>
            <StatusBadge status={status} />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[status] || STATUS_COLORS.borrowed}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}