"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { User, Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { getOrders, createOrder, deleteOrder } from "@/lib/api"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronsLeft, ChevronsRight, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Esquema de validación para el formulario
const orderFormSchema = z.object({
  userId: z.string().min(1, "Debe seleccionar un usuario"),
  productId: z.string().min(1, "Debe seleccionar un producto"),
  quantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "La cantidad debe ser un número mayor a 0" }),
  unitPrice: z
    .string()
    .min(1, "El precio unitario es requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El precio unitario debe ser un número mayor a 0",
    }),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

interface OrdersClientProps {
  users: User[]
  products: Product[]
}

export default function OrdersClient({ users, products }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Estados para el diálogo de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar órdenes al iniciar
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        console.error("Error al cargar órdenes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [toast])

  // Configurar el formulario con React Hook Form y Zod
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userId: "",
      productId: "",
      quantity: "",
      unitPrice: "",
    },
  })

  // Función para mostrar el diálogo de confirmación de eliminación
  function handleDelete(orderId: number) {
    setOrderToDelete(orderId)
    setIsDeleteDialogOpen(true)
  }

  // Función para eliminar una orden después de confirmar
  async function confirmDelete() {
    if (orderToDelete) {
      try {
        setIsSubmitting(true)
        const success = await deleteOrder(orderToDelete)

        if (success) {
          // Actualizar la lista de órdenes
          const updatedOrders = orders.filter((order) => order.idorden !== orderToDelete)
          setOrders(updatedOrders)

          toast({
            title: "Orden eliminada",
            description: "La orden de compra ha sido eliminada exitosamente",
          })
        } else {
          throw new Error("No se pudo eliminar la orden")
        }
      } catch (error) {
        console.error("Error al eliminar orden:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar la orden de compra",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      }
    }
  }

  // Función para manejar el envío del formulario
  async function onSubmit(data: OrderFormValues) {
    try {
      setIsSubmitting(true)
      // Encontrar el usuario y producto seleccionados
      const user = users.find((u) => u.idusuario === Number.parseInt(data.userId))
      const product = products.find((p) => p.idproducto === Number.parseInt(data.productId))

      if (!user || !product) {
        toast({
          title: "Error",
          description: "Usuario o producto no encontrado",
          variant: "destructive",
        })
        return
      }

      // Crear la nueva orden
      const quantity = Number(data.quantity)
      const unitPrice = Number(data.unitPrice)

      const newOrder = await createOrder({
        userId: user.idusuario,
        productId: product.idproducto,
        quantity,
        unitPrice,
      })

      if (newOrder) {
        // Recargar las órdenes para obtener la lista actualizada
        const updatedOrders = await getOrders()
        setOrders(updatedOrders)

        // Resetear el formulario completamente
        form.reset({
          userId: "",
          productId: "",
          quantity: "",
          unitPrice: "",
        })

        // Mostrar mensaje de éxito
        toast({
          title: "Orden creada",
          description: "La orden de compra se ha creado exitosamente",
        })
      } else {
        throw new Error("No se pudo crear la orden")
      }
    } catch (error) {
      console.error("Error al crear la orden:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la orden de compra",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular el gran total de todas las órdenes
  const grandTotal = orders.reduce((total, order) => total + order.cantidad * order.preciounitario, 0)

  // Calcular el gran total de productos con categoría "Smartphone"
  const smartphoneTotal = orders
    .filter((order) => order.producto?.categoria === "Smartphone")
    .reduce((total, order) => total + order.cantidad * order.preciounitario, 0)

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Orden de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} aria-label="Seleccionar usuario">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.idusuario} value={user.idusuario.toString()}>
                              {user.nombre} {user.paterno} {user.materno}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} aria-label="Seleccionar producto">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.idproducto} value={product.idproducto.toString()}>
                              {product.nombre} ({product.categoria})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ingrese la cantidad" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ingrese el precio unitario"
                          min="0.01"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Orden"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Lista de órdenes de compra</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Importe Total</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Cargando órdenes...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No hay órdenes registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  // Mostrar solo las órdenes de la página actual
                  orders
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((order) => (
                      <TableRow key={order.idorden}>
                        <TableCell>{order.idorden}</TableCell>
                        <TableCell>
                          {order.usuario ? `${order.usuario.nombre} ${order.usuario.paterno}` : "N/A"}
                        </TableCell>
                        <TableCell>{order.producto ? order.producto.nombre : "N/A"}</TableCell>
                        <TableCell>{order.producto ? order.producto.categoria : "N/A"}</TableCell>
                        <TableCell>{order.cantidad}</TableCell>
                        <TableCell>{formatCurrency(order.preciounitario)}</TableCell>
                        <TableCell>{formatCurrency(order.cantidad * order.preciounitario)}</TableCell>
                        <TableCell>{new Date(order.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(order.idorden)}
                            aria-label="Eliminar orden"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Controles de paginación */}
          {orders.length > 0 && !loading && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {Math.min(orders.length, (currentPage - 1) * itemsPerPage + 1)} a{" "}
                {Math.min(currentPage * itemsPerPage, orders.length)} de {orders.length} órdenes
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {currentPage === 1 ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5 opacity-50 cursor-not-allowed">
                        <ChevronsLeft className="h-4 w-4" />
                      </span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(1)}
                        aria-label="Primera página"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </PaginationLink>
                    )}
                  </PaginationItem>

                  <PaginationItem>
                    {currentPage === 1 ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5 opacity-50 cursor-not-allowed">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </span>
                    ) : (
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        aria-label="Página anterior"
                      />
                    )}
                  </PaginationItem>

                  {/* Mostrar números de página */}
                  {Array.from({ length: Math.min(5, Math.ceil(orders.length / itemsPerPage)) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {Math.ceil(orders.length / itemsPerPage) > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(Math.ceil(orders.length / itemsPerPage))}
                          isActive={currentPage === Math.ceil(orders.length / itemsPerPage)}
                        >
                          {Math.ceil(orders.length / itemsPerPage)}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    {currentPage === Math.ceil(orders.length / itemsPerPage) ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 opacity-50 cursor-not-allowed">
                        <span>Siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(orders.length / itemsPerPage)))
                        }
                        aria-label="Página siguiente"
                      />
                    )}
                  </PaginationItem>

                  <PaginationItem>
                    {currentPage === Math.ceil(orders.length / itemsPerPage) ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 opacity-50 cursor-not-allowed">
                        <ChevronsRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(Math.ceil(orders.length / itemsPerPage))}
                        aria-label="Última página"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </PaginationLink>
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Filas por página:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Gran Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Gran Total de Productos Smartphone:</span>
              <span>{formatCurrency(smartphoneTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar orden */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isSubmitting && setIsDeleteDialogOpen(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Está seguro de que desea eliminar esta orden de compra? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
