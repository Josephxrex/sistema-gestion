import { Suspense } from "react"
import OrdersClient from "./orders-client"
import { getUsers, getProducts } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default async function OrdersPage() {
  // Obtener datos necesarios para el formulario
  const users = await getUsers()
  const products = await getProducts()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Órdenes de Compra</h1>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <OrdersClient users={users} products={products} />
      </Suspense>
    </div>
  )
}
