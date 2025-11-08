import { typography } from "@/styles/typography"
import { colors } from "@/styles/colors"

export default function Footer() {
  return (
    <footer 
      className={`text-white py-8 mt-12`}
      style={{ backgroundColor: colors.textPrimary }}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p 
          className={`${typography.label} font-bold`}
          style={{ color: "white" }}
        >
          Perpustakaan Naratama
        </p>
        <p 
          className={`${typography.bodySmall} mt-2`}
          style={{ color: colors.textTertiary }}
        >
          © 2025 Digital Library. All rights reserved.
        </p>
      </div>
    </footer>
  )
}