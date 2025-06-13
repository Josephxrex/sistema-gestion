import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sistema de Gestión</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle >Órdenes de Compra</CardTitle>
            <CardDescription>Gestiona las órdenes de compra de productos</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Crea y visualiza órdenes de compra asociadas a usuarios y productos.</p>
          </CardContent>
          <CardFooter>
            <Link href="/orders" className="w-full">
              <Button className="w-full">Ir a Órdenes</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Administra los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Crea, edita y visualiza la información de los usuarios registrados.</p>
          </CardContent>
          <CardFooter>
            <Link href="/users" className="w-full">
              <Button className="w-full">Ir a Usuarios</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
