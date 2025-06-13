import { Suspense } from "react"
import UsersClient from "./users-client"
import { getUsers } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default async function UsersPage() {
  // Obtener la lista de usuarios
  const users = await getUsers()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <UsersClient initialUsers={users} />
      </Suspense>
    </div>
  )
}
