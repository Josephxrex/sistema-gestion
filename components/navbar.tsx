import Link from "next/link"
import { ShoppingCart, Users } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white  border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Sistema de Gestión
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/orders" className="flex items-center space-x-1 hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            <span>Órdenes</span>
          </Link>

          <Link href="/users" className="flex items-center space-x-1 hover:text-primary">
            <Users className="h-5 w-5" />
            <span>Usuarios</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
