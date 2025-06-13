import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "Sistema de Gestión",
  description: "Sistema de gestión de órdenes de compra y usuarios",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body >
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Toaster />
      </body>
    </html>
  )
}
