"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { User } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2, Search, ChevronsLeft, ChevronsRight, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser, deleteUser } from "@/lib/api"



// Esquema de validación para el formulario de usuarios
export const userFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  paterno: z.string().min(1, "El apellido paterno es requerido"),
  materno: z.string().min(1, "El apellido materno es requerido"),
  correo: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo electrónico inválido"),
  estatus: z.boolean(),
})


// Tipo inferido del schema de Zod
type UserFormValues = z.infer<typeof userFormSchema>

interface UsersClientProps {
  initialUsers: User[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResult, setFormResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Ordenar usuarios por fecha de registro (más reciente primero)
  useEffect(() => {
    const sortedUsers = [...initialUsers].sort((a, b) => {
      return new Date(b.fecharegistro).getTime() - new Date(a.fecharegistro).getTime()
    })
    setUsers(sortedUsers)
    setFilteredUsers(sortedUsers)
  }, [initialUsers])

  // Efecto para filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.nombre.toLowerCase().includes(lowercaseSearch) ||
          user.paterno.toLowerCase().includes(lowercaseSearch) ||
          user.materno.toLowerCase().includes(lowercaseSearch) ||
          user.correo.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredUsers(filtered)
    }
    setCurrentPage(1) // Resetear a la primera página cuando se filtra
  }, [searchTerm, users])

  // Configurar el formulario con React Hook Form y Zod 
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nombre: "",
      paterno: "",
      materno: "",
      correo: "",
      estatus: true,
    },
  })


  // Función para abrir el formulario en modo edición
  function handleEdit(user: User) {
    form.reset({
      nombre: user.nombre,
      paterno: user.paterno,
      materno: user.materno,
      correo: user.correo,
      estatus: user.estatus === 1,
    })
    setCurrentUserId(user.idusuario)
    setIsEditing(true)
    setFormResult(null)
    setIsDialogOpen(true)
  }

  // Función para abrir el formulario en modo creación
  function handleCreate() {
    form.reset({
      nombre: "",
      paterno: "",
      materno: "",
      correo: "",
      estatus: true,
    })
    setCurrentUserId(null)
    setIsEditing(false)
    setFormResult(null)
    setIsDialogOpen(true)
  }

  // Función para mostrar el diálogo de confirmación de eliminación
  function handleDelete(userId: number) {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  // Función para eliminar un usuario después de confirmar
  async function confirmDelete() {
    if (userToDelete) {
      try {
        const success = await deleteUser(userToDelete)

        if (success) {
          setUsers(users.filter((user) => user.idusuario !== userToDelete))
          setFilteredUsers(filteredUsers.filter((user) => user.idusuario !== userToDelete))

          toast({
            title: "Usuario eliminado",
            description: "El usuario ha sido eliminado exitosamente",
          })
        } else {
          throw new Error("No se pudo eliminar el usuario")
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el usuario",
          variant: "destructive",
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      }
    }
  }

  // Función para manejar el envío del formulario
  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    setIsSubmitting(true)
    setFormResult(null)

    try {
      if (isEditing && currentUserId) {
        // Actualizar usuario existente
        const updatedUser = await updateUser(currentUserId, {
          nombre: data.nombre,
          paterno: data.paterno,
          materno: data.materno,
          correo: data.correo,
          estatus: data.estatus ? 1 : 0,
        })

        if (updatedUser) {
          const updatedUsers = users.map((user) => {
            if (user.idusuario === currentUserId) {
              return updatedUser
            }
            return user
          })

          setUsers(updatedUsers)
          setFilteredUsers(
            updatedUsers.filter((user) => {
              if (searchTerm.trim() === "") return true
              const lowercaseSearch = searchTerm.toLowerCase()
              return (
                user.nombre.toLowerCase().includes(lowercaseSearch) ||
                user.paterno.toLowerCase().includes(lowercaseSearch) ||
                user.materno.toLowerCase().includes(lowercaseSearch) ||
                user.correo.toLowerCase().includes(lowercaseSearch)
              )
            }),
          )

          setFormResult({
            success: true,
            message: "Usuario actualizado exitosamente",
          })

          // Cerrar el diálogo de edición y mostrar el diálogo de resultado
          setIsDialogOpen(false)
          setIsResultDialogOpen(true)
        } else {
          throw new Error("No se pudo actualizar el usuario")
        }
      } else {
        // Crear nuevo usuario
        const newUser = await createUser({
          nombre: data.nombre,
          paterno: data.paterno,
          materno: data.materno,
          correo: data.correo,
          estatus: data.estatus ? 1 : 0,
        })

        if (newUser) {
          // Ordenar por fecha de registro (más reciente primero)
          const updatedUsers = [newUser, ...users].sort((a, b) => {
            return new Date(b.fecharegistro).getTime() - new Date(a.fecharegistro).getTime()
          })

          setUsers(updatedUsers)
          setFilteredUsers(
            updatedUsers.filter((user) => {
              if (searchTerm.trim() === "") return true
              const lowercaseSearch = searchTerm.toLowerCase()
              return (
                user.nombre.toLowerCase().includes(lowercaseSearch) ||
                user.paterno.toLowerCase().includes(lowercaseSearch) ||
                user.materno.toLowerCase().includes(lowercaseSearch) ||
                user.correo.toLowerCase().includes(lowercaseSearch)
              )
            }),
          )

          setFormResult({
            success: true,
            message: "Usuario creado exitosamente",
          })

          // Cerrar el diálogo de edición y mostrar el diálogo de resultado
          setIsDialogOpen(false)
          setIsResultDialogOpen(true)
        } else {
          throw new Error("No se pudo crear el usuario")
        }
      }

      // Resetear el formulario
      form.reset()
    } catch (error) {
      console.error("Error al guardar el usuario:", error)

      setFormResult({
        success: false,
        message: "Ocurrió un error al guardar el usuario",
      })

      // Mostrar el diálogo de resultado con el error
      setIsResultDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuarios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate}>Nuevo Usuario</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Lista de usuarios registrados</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido Paterno</TableHead>
                  <TableHead>Apellido Materno</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      {searchTerm
                        ? "No se encontraron usuarios con ese criterio de búsqueda"
                        : "No hay usuarios registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                    <TableRow key={user.idusuario}>
                      <TableCell>{user.idusuario}</TableCell>
                      <TableCell>{user.nombre}</TableCell>
                      <TableCell>{user.paterno}</TableCell>
                      <TableCell>{user.materno}</TableCell>
                      <TableCell>{user.correo}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${user.estatus === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {user.estatus === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.fecharegistro)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            aria-label="Editar usuario"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(user.idusuario)}
                            aria-label="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)} a{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
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
                  {Array.from({ length: Math.min(5, Math.ceil(filteredUsers.length / itemsPerPage)) }, (_, i) => {
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

                  {Math.ceil(filteredUsers.length / itemsPerPage) > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / itemsPerPage))}
                          isActive={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                        >
                          {Math.ceil(filteredUsers.length / itemsPerPage)}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    {currentPage === Math.ceil(filteredUsers.length / itemsPerPage) ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 opacity-50 cursor-not-allowed">
                        <span>Siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))
                        }
                        aria-label="Página siguiente"
                      />
                    )}
                  </PaginationItem>

                  <PaginationItem>
                    {currentPage === Math.ceil(filteredUsers.length / itemsPerPage) ? (
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 opacity-50 cursor-not-allowed">
                        <ChevronsRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / itemsPerPage))}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !isSubmitting && setIsDialogOpen(open)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Paterno</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el apellido paterno" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Materno</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el apellido materno" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <div className="py-2">
                  <p className="text-sm text-muted-foreground">
                    Fecha de Registro:{" "}
                    {currentUserId && users.find((u) => u.idusuario === currentUserId)?.fecharegistro}
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="estatus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estatus</FormLabel>
                      <div className="text-sm text-muted-foreground">{field.value ? "Activo" : "Inactivo"}</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : isEditing ? (
                    "Actualizar"
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de resultado */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{formResult?.success ? "Operación exitosa" : "Error"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex items-center space-x-2">
            {formResult?.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <p>{formResult?.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsResultDialogOpen(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}