import type { User, Product } from "./types"

// ENV  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

// Función para obtener un usuario por ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${id}:`, error)
    return null
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: Omit<User, "idusuario" | "fecharegistro">): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
        fecharegistro: new Date().toISOString().split("T")[0],
      }),
    })

    if (!response.ok) {
      throw new Error(`Error al crear usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return null
  }
}

// Función para actualizar un usuario existente
export async function updateUser(id: number, userData: Partial<User>): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`Error al actualizar usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${id}:`, error)
    return null
  }
}

// Función para eliminar un usuario
export async function deleteUser(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error al eliminar usuario: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${id}:`, error)
    return false
  }
}

// Función para obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/producto`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

// Función para obtener un producto por ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/producto/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    return null
  }
}

// Función para obtener todas las órdenes
export async function getOrders(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/orden`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener órdenes: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

// Función para crear una nueva orden
export async function createOrder(orderData: {
  userId: number
  productId: number
  quantity: number
  unitPrice: number
}): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/orden`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: { idusuario: orderData.userId },
        producto: { idproducto: orderData.productId },
        cantidad: orderData.quantity,
        preciounitario: orderData.unitPrice,
        fecha: new Date().toISOString().split("T")[0],
      }),
    })

    if (!response.ok) {
      throw new Error(`Error al crear orden: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al crear orden:", error)
    return null
  }
}

// Función para eliminar una orden
export async function deleteOrder(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/orden/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error al eliminar orden: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar orden con ID ${id}:`, error)
    return false
  }
}
