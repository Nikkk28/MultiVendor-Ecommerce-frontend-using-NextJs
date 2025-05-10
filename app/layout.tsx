import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import PageWrapper from "@/components/page-wrapper"
import ScrollProvider from "@/components/scroll-provider"
import RouteLoader from "@/components/route-loader" // 👈 Import it

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MultiMart - Shop from Vendors Across the Country",
  description:
    "MultiMart is a multi-vendor e-commerce platform where users can buy anything from vendors all across the country.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <RouteLoader /> {/* 👈 Adds animated full-page route loader */}
            <ScrollProvider>
              <Header />
              <PageWrapper>{children}</PageWrapper>
              <Footer />
            </ScrollProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
