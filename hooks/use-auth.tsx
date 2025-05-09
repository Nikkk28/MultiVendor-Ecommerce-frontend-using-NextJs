"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"

// Define user type
export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: "CUSTOMER" | "VENDOR" | "ADMIN"
  address?: {
    country: string
    state: string
    city: string
    zipCode: string
    street: string
    isDefault: boolean
  }
}

// Define vendor type
export interface Vendor {
  id: number
  userId: number
  storeName: string
  storeDescription: string
  storeAddress: {
    country: string
    state: string
    city: string
    zipCode: string
    street: string
  }
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
  rejectionReason?: string
  rating: number
  productCount: number
  specialty: string
  joinedDate: string
  contactEmail: string
  contactPhone: string
}

// Add interfaces for the dashboard data
export interface ProductSummaryDto {
  id: number
  name: string
  price: number
  inventory: number
  category: {
    id: number
    name: string
  }
  createdAt: string
}

export interface OrderSummaryDto {
  id: number
  orderNumber: string
  createdAt: string
  status: string
  total: number
  itemCount: number
}

export interface VendorDashboardDto {
  vendorProfile: Vendor
  productCount: number
  recentProducts: ProductSummaryDto[]
  orderCount: number
  recentOrders: OrderSummaryDto[]
  totalRevenue: number
  monthlyRevenue: number
  previousMonthRevenue: number
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<{ success: boolean; message: string; user?: User }>
  getVendorDetails: () => Promise<VendorDashboardDto | null>
  verifyEmail: (token: string) => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (storedUser && token) {
          // Parse user data
          const userData = JSON.parse(storedUser)
          setUser(userData)

          // Also set in cookie for middleware
          document.cookie = `user=${encodeURIComponent(storedUser)}; path=/; max-age=86400; SameSite=Lax`
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        document.cookie = "user=; path=/; max-age=0"
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true)
    try {
      // Prepare login credentials
      const credentials: Record<string, string> = {}

      // Determine if input is email or username
      if (usernameOrEmail.includes("@")) {
        credentials.email = usernameOrEmail
      } else {
        credentials.username = usernameOrEmail
      }

      credentials.password = password

      console.log("Sending login request with credentials:", credentials)

      // Call the API endpoint
      const response = await authApi.login(credentials)
      console.log("Login response:", response)

      // Store the token
      localStorage.setItem("token", response.token)

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.user))

      // Set in cookie for middleware
      document.cookie = `user=${encodeURIComponent(JSON.stringify(response.user))}; path=/; max-age=86400; SameSite=Lax`

      // Update state
      setUser(response.user)
      console.log("User state updated:", response.user)

      // Note: We're not redirecting here anymore - that's handled in the login page component
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    document.cookie = "user=; path=/; max-age=0; SameSite=Lax"
    setUser(null)
    router.push("/")
  }

  // Register function with auto-login
  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      console.log("Registering user with data:", userData)

      // Send all user data to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      // Parse the JSON response
      const data = await response.json()

      // Check if the response was not successful
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.")
      }

      console.log("Registration successful:", data.message)

      // Auto-login after successful registration
      if (data.token && data.user) {
        // Store the token
        localStorage.setItem("token", data.token)

        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user))

        // Set in cookie for middleware
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400; SameSite=Lax`

        // Update state
        setUser(data.user)

        return {
          success: true,
          message: data.message,
          user: data.user,
        }
      }

      // If no token/user data was returned, just return success message
      return {
        success: true,
        message: data.message,
      }
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get vendor details function - updated to use correct endpoint
  const getVendorDetails = async (): Promise<VendorDashboardDto | null> => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No auth token found")
        return null
      }

      // Use the correct endpoint based on the backend controller
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
      const url = `${apiUrl}/vendors/dashboard`

      console.log("Fetching vendor dashboard from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        console.error("Failed to get vendor dashboard, status:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        return null
      }

      const data = await response.json()
      console.log("Vendor dashboard data:", data)
      return data
    } catch (error) {
      console.error("Failed to get vendor dashboard:", error)
      return null
    }
  }

  // Verify email function
  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token)
    } catch (error) {
      console.error("Email verification failed:", error)
      throw error
    }
  }

  // Context value
  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    getVendorDetails,
    verifyEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
