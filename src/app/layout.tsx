import type { Metadata } from "next"
import "./globals.css"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Providers } from "./providers"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
})

export const metadata: Metadata = {
  title: "Perpustakaan Naratama",
  description: "Perpustakaan Digital Modern",
  icons: {
    icon: "images/logo(min).ico"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
