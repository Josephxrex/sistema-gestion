// Tipos para usuarios
export interface User {
  idusuario: number
  nombre: string
  paterno: string
  materno: string
  correo: string
  estatus: number
  fecharegistro: string
}

// Tipos para productos
export interface Product {
  idproducto: number
  nombre: string
  categoria: string
  moneda: string
  estatus: number
}

// Tipos para órdenes de compra
export interface PurchaseOrder {
  id: number
  userId: number
  userName: string
  productId: number
  productName: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  date: string
}

// Tipo para el formulario de órdenes
export interface PurchaseOrderFormData {
  userId: number
  productId: number
  quantity: number
  unitPrice: number
}

// Tipo para el formulario de usuarios
export interface UserFormData {
  nombre: string
  paterno: string
  materno: string
  correo: string
  estatus: number
}
