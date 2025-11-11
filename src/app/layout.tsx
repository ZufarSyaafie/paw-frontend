import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // 1. Import

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Perpustakaan Naratama",
  description: "Perpustakaan Digital Modern",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 2. Tambahkan 'suppressHydrationWarning'
    <html lang="en" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* 3. Bungkus 'children' dengan ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}