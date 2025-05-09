// API client for making requests to the Spring Boot backend

// Update the API_BASE_URL to use the provided URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Flag to enable mock data when backend is unavailable
const USE_MOCK_DATA = false

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    // Try to get error message from the response
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `API error: ${response.status}`)
    } catch (e) {
      throw new Error(`API error: ${response.status}`)
    }
  }

  return response.json()
}

// Generic request function with mock data fallback
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Add authorization header if token exists
  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    // Try to connect to the real backend
    const response = await fetch(url, config)
    return await handleResponse(response)
  } catch (error) {
    console.warn(`API request failed: ${error}. Using mock data instead.`)

    // If backend is unavailable and mock data is enabled, use mock data
    if (USE_MOCK_DATA) {
      return getMockResponse(endpoint, options)
    }

    throw error
  }
}

// Mock users for testing
export const MOCK_USERS = {
  CUSTOMER: {
    username: "customer",
    password: "password123",
  },
  VENDOR: {
    username: "vendor",
    password: "password123",
    email: "vendor@example.com",
  },
  ADMIN: {
    username: "admin",
    password: "password123",
  },
}

// Mock data function
function getMockResponse(endpoint: string, options: RequestInit = {}) {
  console.log(`Using mock data for endpoint: ${endpoint}`, options)

  // Authentication endpoints
  if (endpoint.startsWith("/auth")) {
    if (endpoint === "/auth/register" && options.method === "POST") {
      try {
        const userData = JSON.parse(options.body as string)
        console.log("Mock API received registration data:", userData)

        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
          return {
            success: false,
            message: "Missing required fields for registration",
          }
        }

        // Check if this is a vendor registration
        const isVendor = userData.role === "VENDOR"

        // Generate a mock user ID
        const userId = Math.floor(Math.random() * 1000) + 1

        // Create a mock user object for auto-login
        const user = {
          id: userId,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          address: userData.address,
        }

        // Generate a mock token
        const token = `mock-jwt-token-${Date.now()}`

        return {
          success: true,
          message: isVendor ? "Vendor registration successful" : "Registration successful",
          token: token,
          user: user,
        }
      } catch (error) {
        console.error("Error processing registration:", error)
        return {
          success: false,
          message: "Invalid registration data format",
        }
      }
    }

    if (endpoint === "/auth/login" && options.method === "POST") {
      const body = JSON.parse(options.body as string)
      const username = body.username || body.email

      // Check if the credentials match any of our mock users
      let role = "CUSTOMER"

      if (username === MOCK_USERS.VENDOR.username || username === MOCK_USERS.VENDOR.email) {
        role = "VENDOR"
      } else if (username === MOCK_USERS.ADMIN.username) {
        role = "ADMIN"
      }

      // Mock user data based on username/email
      return {
        token: "mock-jwt-token",
        user: {
          id: role === "ADMIN" ? 3 : role === "VENDOR" ? 2 : 1,
          username: username,
          firstName: "John",
          lastName: "Doe",
          email: username.includes("@") ? username : `${username}@example.com`,
          phoneNumber: "+91 9876543210",
          role: role,
          address: {
            country: "India",
            state: "Maharashtra",
            city: "Mumbai",
            zipCode: "400001",
            street: "123 Main St",
            isDefault: true,
          },
        },
      }
    }

    if (endpoint === "/auth/forgot-password") {
      return { success: true, message: "Password reset email sent" }
    }

    if (endpoint === "/auth/reset-password" && options.method === "POST") {
      const body = JSON.parse(options.body as string)
      if (!body.token || !body.newPassword) {
        return { success: false, message: "Token and new password are required" }
      }
      return { success: true, message: "Password has been reset successfully" }
    }

    if (endpoint.startsWith("/auth/verify-email")) {
      const token = endpoint.split("?token=")[1]
      if (!token) {
        return { success: false, message: "Token is required" }
      }
      return { success: true, message: "Email verified successfully" }
    }
  }

  // Categories endpoints
  if (endpoint.startsWith("/categories")) {
    // Create category
    if (endpoint === "/categories" && options.method === "POST") {
      const categoryData = JSON.parse(options.body as string)
      const newCategory = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...categoryData,
        productCount: 0,
        subcategories: [],
        createdAt: new Date().toISOString(),
      }
      return newCategory
    }

    // Update category
    if (endpoint.match(/\/categories\/\d+$/) && options.method === "PUT") {
      const categoryId = Number.parseInt(endpoint.split("/").pop() || "0")
      const categoryData = JSON.parse(options.body as string)
      return {
        id: categoryId,
        ...categoryData,
        updatedAt: new Date().toISOString(),
      }
    }

    // Delete category
    if (endpoint.match(/\/categories\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Category deleted successfully" }
    }

    // Add subcategory
    if (endpoint.match(/\/categories\/\d+\/subcategories$/) && options.method === "POST") {
      const categoryId = Number.parseInt(endpoint.split("/")[2])
      const subcategoryData = JSON.parse(options.body as string)
      const newSubcategory = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...subcategoryData,
        productCount: 0,
        createdAt: new Date().toISOString(),
      }

      // Return the updated category with the new subcategory
      return {
        id: categoryId,
        name: "Updated Category",
        slug: "updated-category",
        subcategories: [newSubcategory],
      }
    }

    // Update subcategory
    if (endpoint.match(/\/categories\/\d+\/subcategories\/\d+$/) && options.method === "PUT") {
      return { success: true, message: "Subcategory updated successfully" }
    }

    // Delete subcategory
    if (endpoint.match(/\/categories\/\d+\/subcategories\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Subcategory deleted successfully" }
    }

    if (endpoint === "/categories") {
      return [
        {
          id: 1,
          name: "Electronics",
          slug: "electronics",
          image: "/electronics-category.png",
          description: "Latest gadgets and electronic items",
          productCount: 5240,
          featured: true,
          subcategories: [
            { id: 1, name: "Smartphones", slug: "smartphones", productCount: 1250 },
            { id: 2, name: "Laptops", slug: "laptops", productCount: 980 },
            { id: 3, name: "Audio", slug: "audio", productCount: 1540 },
            { id: 4, name: "Cameras", slug: "cameras", productCount: 760 },
          ],
        },
        {
          id: 2,
          name: "Fashion",
          slug: "fashion",
          image: "/fashion-category.png",
          description: "Trendy clothing and accessories",
          productCount: 8760,
          featured: true,
          subcategories: [
            { id: 5, name: "Men's Clothing", slug: "mens-clothing", productCount: 2340 },
            { id: 6, name: "Women's Clothing", slug: "womens-clothing", productCount: 3120 },
            { id: 7, name: "Footwear", slug: "footwear", productCount: 1850 },
            { id: 8, name: "Accessories", slug: "accessories", productCount: 1450 },
          ],
        },
        {
          id: 3,
          name: "Home & Kitchen",
          slug: "home-kitchen",
          image: "/home-and-kitchen-essentials.png",
          description: "Everything for your home",
          productCount: 3980,
          featured: true,
          subcategories: [
            { id: 9, name: "Furniture", slug: "furniture", productCount: 1240 },
            { id: 10, name: "Appliances", slug: "appliances", productCount: 980 },
            { id: 11, name: "Decor", slug: "decor", productCount: 1120 },
            { id: 12, name: "Kitchenware", slug: "kitchenware", productCount: 640 },
          ],
        },
      ]
    }

    if (endpoint === "/categories/featured") {
      return [
        {
          id: 1,
          name: "Electronics",
          slug: "electronics",
          image: "/electronics-category.png",
          description: "Latest gadgets and electronic items",
          productCount: 5240,
          featured: true,
          subcategories: [
            { id: 1, name: "Smartphones", slug: "smartphones", productCount: 1250 },
            { id: 2, name: "Laptops", slug: "laptops", productCount: 980 },
            { id: 3, name: "Audio", slug: "audio", productCount: 1540 },
          ],
        },
        {
          id: 2,
          name: "Fashion",
          slug: "fashion",
          image: "/fashion-category.png",
          description: "Trendy clothing and accessories",
          productCount: 8760,
          featured: true,
          subcategories: [
            { id: 5, name: "Men's Clothing", slug: "mens-clothing", productCount: 2340 },
            { id: 6, name: "Women's Clothing", slug: "womens-clothing", productCount: 3120 },
          ],
        },
      ]
    }

    // Handle category by ID or slug
    if (endpoint.match(/\/categories\/[a-zA-Z0-9-]+$/)) {
      const categories = [
        {
          id: 1,
          name: "Electronics",
          slug: "electronics",
          image: "/electronics-category.png",
          description: "Latest gadgets and electronic items",
          productCount: 5240,
          featured: true,
          subcategories: [
            { id: 1, name: "Smartphones", slug: "smartphones", productCount: 1250 },
            { id: 2, name: "Laptops", slug: "laptops", productCount: 980 },
            { id: 3, name: "Audio", slug: "audio", productCount: 1540 },
            { id: 4, name: "Cameras", slug: "cameras", productCount: 760 },
          ],
        },
        {
          id: 2,
          name: "Fashion",
          slug: "fashion",
          image: "/fashion-category.png",
          description: "Trendy clothing and accessories",
          productCount: 8760,
          featured: true,
          subcategories: [
            { id: 5, name: "Men's Clothing", slug: "mens-clothing", productCount: 2340 },
            { id: 6, name: "Women's Clothing", slug: "womens-clothing", productCount: 3120 },
            { id: 7, name: "Footwear", slug: "footwear", productCount: 1850 },
            { id: 8, name: "Accessories", slug: "accessories", productCount: 1450 },
          ],
        },
      ]

      const idOrSlug = endpoint.split("/").pop()
      return categories.find((c) => c.id.toString() === idOrSlug || c.slug === idOrSlug) || null
    }

    // Handle products by category
    if (endpoint.match(/\/categories\/[a-zA-Z0-9-]+\/products/)) {
      return {
        content: generateMockProducts(10),
        totalPages: 5,
        totalElements: 50,
        size: 10,
        number: 0,
      }
    }
  }

  // Products endpoints
  if (endpoint.startsWith("/products")) {
    if (endpoint === "/products" || endpoint.startsWith("/products?")) {
      return {
        content: generateMockProducts(12),
        totalPages: 8,
        totalElements: 96,
        size: 12,
        number: 0,
      }
    }

    if (endpoint.match(/\/products\/\d+$/)) {
      const productId = Number.parseInt(endpoint.split("/").pop() || "1")
      return generateMockProduct(productId)
    }

    if (endpoint === "/products/trending") {
      return generateMockProducts(8)
    }

    if (endpoint === "/products/recommended") {
      return generateMockProducts(8)
    }

    if (endpoint === "/products/recently-viewed") {
      return generateMockProducts(4)
    }

    if (endpoint.match(/\/products\/\d+\/similar/)) {
      return generateMockProducts(4)
    }

    if (endpoint.match(/\/products\/\d+\/reviews/)) {
      return generateMockReviews(5)
    }

    if (endpoint.match(/\/products\/\d+\/reviews/) && options.method === "POST") {
      const reviewData = JSON.parse(options.body as string)
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        user: {
          id: 1,
          name: "John Doe",
          username: "johndoe",
        },
        ...reviewData,
        verified: false,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
      }
    }

    if (endpoint.match(/\/reviews\/\d+\/helpful/) && options.method === "POST") {
      return { success: true, message: "Review marked as helpful" }
    }
  }

  // Cart endpoints
  if (endpoint.startsWith("/cart")) {
    if (endpoint === "/cart" && (!options.method || options.method === "GET")) {
      return {
        id: 1,
        userId: 1,
        items: generateMockCartItems(3),
        totalItems: 3,
        subtotal: 7997,
        tax: 1440,
        shipping: 100,
        total: 9537,
        couponCode: null,
        couponDiscount: 0,
        updatedAt: new Date().toISOString(),
      }
    }

    if (endpoint === "/cart/items" && options.method === "POST") {
      const body = JSON.parse(options.body as string)
      if (!body.productId || !body.quantity) {
        return { success: false, message: "Product ID and quantity are required" }
      }
      return { success: true, message: "Item added to cart" }
    }

    if (endpoint.match(/\/cart\/items\/\d+$/) && options.method === "PUT") {
      const body = JSON.parse(options.body as string)
      if (!body.quantity) {
        return { success: false, message: "Quantity is required" }
      }
      return { success: true, message: "Cart item updated" }
    }

    if (endpoint.match(/\/cart\/items\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Item removed from cart" }
    }

    if (endpoint === "/cart" && options.method === "DELETE") {
      return { success: true, message: "Cart cleared successfully" }
    }
  }

  // Wishlist endpoints
  if (endpoint.startsWith("/users/wishlist")) {
    if (endpoint === "/users/wishlist" && (!options.method || options.method === "GET")) {
      return generateMockWishlistItems(5)
    }

    if (endpoint === "/users/wishlist" && options.method === "POST") {
      const body = JSON.parse(options.body as string)
      if (!body.productId) {
        return { success: false, message: "Product ID is required" }
      }
      return { success: true, message: "Item added to wishlist" }
    }

    if (endpoint.match(/\/users\/wishlist\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Item removed from wishlist" }
    }
  }

  // Order endpoints
  if (endpoint.startsWith("/orders")) {
    if (endpoint === "/orders" && (!options.method || options.method === "GET")) {
      return {
        content: generateMockOrders(5),
        totalPages: 2,
        totalElements: 8,
        size: 5,
        number: 0,
      }
    }

    if (endpoint.match(/\/orders\/\d+$/) && options.method === "GET") {
      const orderId = Number.parseInt(endpoint.split("/").pop() || "1")
      return generateMockOrderDetail(orderId)
    }

    if (endpoint === "/orders" && options.method === "POST") {
      const orderRequest = JSON.parse(options.body as string)
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        orderNumber: `ORD-${Date.now()}`,
        status: "PENDING",
        items: orderRequest.items || generateMockOrderItems(3),
        subtotal: 7997,
        tax: 1440,
        shipping: 100,
        discount: 0,
        total: 9537,
        createdAt: new Date().toISOString(),
      }
    }

    if (endpoint.match(/\/orders\/\d+\/cancel$/) && options.method === "POST") {
      return { success: true, message: "Order cancelled successfully" }
    }
  }

  // Vendor endpoints
  if (endpoint.startsWith("/vendors")) {
    if (endpoint === "/vendors/profile" && options.method === "GET") {
      return {
        id: 2,
        userId: 2,
        storeName: "ElectroHub",
        storeDescription: "Best electronics store in town",
        storeAddress: {
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          zipCode: "400001",
          street: "456 Market St",
        },
        approvalStatus: "APPROVED",
        rejectionReason: null,
        rating: 4.8,
        productCount: 24,
        specialty: "Electronics",
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        contactEmail: "store@electrohub.com",
        contactPhone: "+91 9876543210",
      }
    }

    if (endpoint === "/vendors/profile" && options.method === "PUT") {
      const vendorData = JSON.parse(options.body as string)
      return {
        id: 2,
        userId: 2,
        ...vendorData,
        approvalStatus: "APPROVED",
        rating: 4.8,
        productCount: 24,
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    if (endpoint === "/vendors/products") {
      return {
        content: generateMockProducts(8),
        totalPages: 3,
        totalElements: 24,
        size: 8,
        number: 0,
      }
    }

    if (endpoint.match(/\/vendors\/products\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Product deleted successfully" }
    }

    if (endpoint === "/vendors/products" && options.method === "POST") {
      const productData = JSON.parse(options.body as string)
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        ...productData,
        createdAt: new Date().toISOString(),
      }
    }

    if (endpoint.match(/\/vendors\/products\/\d+$/) && options.method === "PUT") {
      const productId = Number.parseInt(endpoint.split("/").pop() || "0")
      const productData = JSON.parse(options.body as string)
      return {
        id: productId,
        ...productData,
        updatedAt: new Date().toISOString(),
      }
    }

    // Get vendor details
    if (endpoint.match(/\/vendors\/\d+$/)) {
      const vendorId = Number.parseInt(endpoint.split("/").pop() || "1")
      return {
        id: vendorId,
        userId: vendorId,
        storeName: "ElectroHub",
        storeDescription: "Best electronics store in town",
        storeAddress: {
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          zipCode: "400001",
          street: "456 Market St",
        },
        approvalStatus: "APPROVED",
        rejectionReason: null,
        rating: 4.8,
        productCount: 24,
        specialty: "Electronics",
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        contactEmail: "store@electrohub.com",
        contactPhone: "+91 9876543210",
      }
    }
  }

  // Admin endpoints
  if (endpoint.startsWith("/admin")) {
    if (endpoint === "/admin/vendors") {
      return {
        content: [
          {
            id: 1,
            userId: 2,
            storeName: "ElectroHub",
            storeDescription: "Best electronics store in town",
            storeAddress: {
              country: "India",
              state: "Maharashtra",
              city: "Mumbai",
              zipCode: "400001",
              street: "456 Market St",
            },
            approvalStatus: "APPROVED",
            rejectionReason: null,
            rating: 4.8,
            productCount: 24,
            specialty: "Electronics",
            joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            contactEmail: "store@electrohub.com",
            contactPhone: "+91 9876543210",
          },
          {
            id: 2,
            userId: 3,
            storeName: "FashionFiesta",
            storeDescription: "Trendy fashion for all",
            storeAddress: {
              country: "India",
              state: "Delhi",
              city: "New Delhi",
              zipCode: "110001",
              street: "789 Fashion St",
            },
            approvalStatus: "PENDING",
            rejectionReason: null,
            rating: 0,
            productCount: 0,
            specialty: "Fashion",
            joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            contactEmail: "store@fashionfiesta.com",
            contactPhone: "+91 9876543211",
          },
        ],
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0,
      }
    }

    if (endpoint.match(/\/admin\/vendors\/\d+$/)) {
      const vendorId = Number.parseInt(endpoint.split("/").pop() || "1")
      return {
        id: vendorId,
        userId: vendorId + 1,
        storeName: vendorId === 1 ? "ElectroHub" : "FashionFiesta",
        storeDescription: vendorId === 1 ? "Best electronics store in town" : "Trendy fashion for all",
        storeAddress: {
          country: "India",
          state: vendorId === 1 ? "Maharashtra" : "Delhi",
          city: vendorId === 1 ? "Mumbai" : "New Delhi",
          zipCode: vendorId === 1 ? "400001" : "110001",
          street: vendorId === 1 ? "456 Market St" : "789 Fashion St",
        },
        approvalStatus: vendorId === 1 ? "APPROVED" : "PENDING",
        rejectionReason: null,
        rating: vendorId === 1 ? 4.8 : 0,
        productCount: vendorId === 1 ? 24 : 0,
        specialty: vendorId === 1 ? "Electronics" : "Fashion",
        joinedDate: new Date(Date.now() - (vendorId === 1 ? 90 : 5) * 24 * 60 * 60 * 1000).toISOString(),
        contactEmail: vendorId === 1 ? "store@electrohub.com" : "store@fashionfiesta.com",
        contactPhone: vendorId === 1 ? "+91 9876543210" : "+91 9876543211",
      }
    }

    if (endpoint.match(/\/admin\/vendors\/\d+\/approve$/) && options.method === "POST") {
      return { success: true, message: "Vendor approved successfully" }
    }

    if (endpoint.match(/\/admin\/vendors\/\d+\/reject$/) && options.method === "POST") {
      return { success: true, message: "Vendor rejected successfully" }
    }

    if (endpoint === "/admin/categories") {
      return [
        {
          id: 1,
          name: "Electronics",
          slug: "electronics",
          image: "/electronics-category.png",
          description: "Latest gadgets and electronic items",
          productCount: 5240,
          featured: true,
          subcategories: [
            { id: 1, name: "Smartphones", slug: "smartphones", productCount: 1250 },
            { id: 2, name: "Laptops", slug: "laptops", productCount: 980 },
            { id: 3, name: "Audio", slug: "audio", productCount: 1540 },
            { id: 4, name: "Cameras", slug: "cameras", productCount: 760 },
          ],
        },
        {
          id: 2,
          name: "Fashion",
          slug: "fashion",
          image: "/fashion-category.png",
          description: "Trendy clothing and accessories",
          productCount: 8760,
          featured: true,
          subcategories: [
            { id: 5, name: "Men's Clothing", slug: "mens-clothing", productCount: 2340 },
            { id: 6, name: "Women's Clothing", slug: "womens-clothing", productCount: 3120 },
            { id: 7, name: "Footwear", slug: "footwear", productCount: 1850 },
            { id: 8, name: "Accessories", slug: "accessories", productCount: 1450 },
          ],
        },
      ]
    }

    if (endpoint.match(/\/admin\/categories\/\d+$/)) {
      const categoryId = Number.parseInt(endpoint.split("/").pop() || "1")
      const categories = [
        {
          id: 1,
          name: "Electronics",
          slug: "electronics",
          image: "/electronics-category.png",
          description: "Latest gadgets and electronic items",
          productCount: 5240,
          featured: true,
          subcategories: [
            { id: 1, name: "Smartphones", slug: "smartphones", productCount: 1250 },
            { id: 2, name: "Laptops", slug: "laptops", productCount: 980 },
            { id: 3, name: "Audio", slug: "audio", productCount: 1540 },
            { id: 4, name: "Cameras", slug: "cameras", productCount: 760 },
          ],
        },
        {
          id: 2,
          name: "Fashion",
          slug: "fashion",
          image: "/fashion-category.png",
          description: "Trendy clothing and accessories",
          productCount: 8760,
          featured: true,
          subcategories: [
            { id: 5, name: "Men's Clothing", slug: "mens-clothing", productCount: 2340 },
            { id: 6, name: "Women's Clothing", slug: "womens-clothing", productCount: 3120 },
            { id: 7, name: "Footwear", slug: "footwear", productCount: 1850 },
            { id: 8, name: "Accessories", slug: "accessories", productCount: 1450 },
          ],
        },
      ]
      return categories.find((c) => c.id === categoryId) || null
    }

    if (endpoint === "/admin/categories" && options.method === "POST") {
      const categoryData = JSON.parse(options.body as string)
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        ...categoryData,
        productCount: 0,
        subcategories: [],
        createdAt: new Date().toISOString(),
      }
    }

    if (endpoint.match(/\/admin\/categories\/\d+$/) && options.method === "PUT") {
      const categoryId = Number.parseInt(endpoint.split("/").pop() || "0")
      const updatedCategoryData = JSON.parse(options.body as string)
      return {
        id: categoryId,
        ...updatedCategoryData,
        updatedAt: new Date().toISOString(),
      }
    }

    if (endpoint.match(/\/admin\/categories\/\d+$/) && options.method === "DELETE") {
      return { success: true, message: "Category deleted successfully" }
    }
  }

  // Default fallback
  return { message: "Mock data not implemented for this endpoint" }
}

// Helper functions to generate mock data
function generateMockProduct(id: number) {
  const vendors = [
    { id: 1, name: "ElectroHub", rating: 4.8 },
    { id: 2, name: "FashionFiesta", rating: 4.7 },
    { id: 3, name: "HomeDecorPlus", rating: 4.9 },
  ]

  const categories = [
    { id: 1, name: "Electronics", slug: "electronics" },
    { id: 2, name: "Fashion", slug: "fashion" },
    { id: 3, name: "Home & Kitchen", slug: "home-kitchen" },
  ]

  const subcategories = [
    { id: 1, name: "Smartphones", slug: "smartphones" },
    { id: 2, name: "Laptops", slug: "laptops" },
    { id: 3, name: "Audio", slug: "audio" },
  ]

  const isOnSale = Math.random() > 0.5
  const price = Math.floor(Math.random() * 5000) + 999
  const originalPrice = isOnSale ? price + Math.floor(price * 0.3) : null
  const discountPercentage = isOnSale ? Math.floor(((originalPrice! - price) / originalPrice!) * 100) : null

  return {
    id,
    name: `Premium Product ${id}`,
    description:
      "This is a high-quality product with excellent features. It's designed to provide the best user experience and satisfaction. Made with premium materials and advanced technology.",
    price,
    originalPrice,
    images: [
      `/placeholder.svg?height=600&width=600&query=product ${id} main view`,
      `/placeholder.svg?height=600&width=600&query=product ${id} side view`,
      `/placeholder.svg?height=600&width=600&query=product ${id} detail view`,
    ],
    category: categories[id % categories.length],
    subcategory: subcategories[id % subcategories.length],
    vendor: vendors[id % vendors.length],
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviewCount: Math.floor(Math.random() * 500) + 50,
    inventory: Math.floor(Math.random() * 100),
    specifications: [
      { name: "Dimension", value: "10 x 5 x 2 cm" },
      { name: "Weight", value: "250g" },
      { name: "Material", value: "Premium Quality" },
      { name: "Warranty", value: "1 Year" },
    ],
    tags: ["premium", "quality", "bestseller"],
    isOnSale,
    discountPercentage,
    inStock: Math.random() > 0.2,
    sku: `PROD-${id}`,
    weight: 0.5,
    dimensions: {
      length: 10,
      width: 5,
      height: 2,
    },
    shippingInfo: {
      freeShipping: true,
      estimatedDelivery: "3-5 days",
    },
    reviews: generateMockReviews(5),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function generateMockProducts(count: number) {
  return Array.from({ length: count }, (_, i) => generateMockProduct(i + 1))
}

function generateMockReviews(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    user: {
      id: i + 100,
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
    },
    rating: Math.floor(Math.random() * 2) + 4,
    title: `Great product, highly recommend!`,
    comment:
      "This product exceeded my expectations. The quality is excellent and it works perfectly. I would definitely buy it again.",
    verified: Math.random() > 0.3,
    helpfulCount: Math.floor(Math.random() * 20),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

function generateMockCartItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    product: {
      id: i + 1,
      name: `Product ${i + 1}`,
      image: `/placeholder.svg?height=100&width=100&query=product ${i + 1} thumbnail`,
      price: 1999 + i * 500,
      vendor: {
        id: (i % 3) + 1,
        name: `Vendor ${(i % 3) + 1}`,
      },
    },
    quantity: Math.floor(Math.random() * 3) + 1,
    price: 1999 + i * 500,
  }))
}

function generateMockWishlistItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    productId: i + 1,
    product: {
      id: i + 1,
      name: `Product ${i + 1}`,
      image: `/placeholder.svg?height=100&width=100&query=product ${i + 1} thumbnail`,
      price: 1999 + i * 500,
      originalPrice: Math.random() > 0.5 ? 2499 + i * 500 : null,
      vendor: {
        id: (i % 3) + 1,
        name: `Vendor ${(i % 3) + 1}`,
      },
      rating: (Math.random() * 2 + 3).toFixed(1),
    },
    addedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

function generateMockOrders(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    orderNumber: `ORD-${10000 + i}`,
    status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"][i % 5],
    items: generateMockOrderItems(Math.floor(Math.random() * 3) + 1),
    subtotal: 1999 * (i + 1),
    tax: Math.floor(1999 * (i + 1) * 0.18),
    shipping: 100,
    discount: 0,
    total: 1999 * (i + 1) + Math.floor(1999 * (i + 1) * 0.18) + 100,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

function generateMockOrderItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    productId: i + 1,
    productName: `Product ${i + 1}`,
    productImage: `/placeholder.svg?height=100&width=100&query=product ${i + 1} thumbnail`,
    quantity: Math.floor(Math.random() * 3) + 1,
    price: 1999,
    vendorId: (i % 3) + 1,
    vendorName: `Vendor ${(i % 3) + 1}`,
  }))
}

function generateMockOrderDetail(id: number) {
  return {
    id,
    orderNumber: `ORD-${10000 + id}`,
    userId: 1,
    items: generateMockOrderItems(Math.floor(Math.random() * 3) + 1),
    status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"][id % 5],
    shippingAddress: {
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      zipCode: "400001",
      street: "123 Main St",
    },
    billingAddress: {
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      zipCode: "400001",
      street: "123 Main St",
    },
    paymentMethod: "Credit Card",
    paymentStatus: ["PENDING", "PAID", "FAILED"][id % 3],
    subtotal: 1999 * id,
    tax: Math.floor(1999 * id * 0.18),
    shipping: 100,
    discount: 0,
    total: 1999 * id + Math.floor(1999 * id * 0.18) + 100,
    couponCode: null,
    notes: "",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Authentication API
export const authApi = {
  register: (userData: any) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials: any) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),

  verifyEmail: (token: string) => request(`/auth/verify-email?token=${token}`),
}

// Categories API
export const categoriesApi = {
  getAll: () => request("/categories"),

  getById: (idOrSlug: string | number) => request(`/categories/${idOrSlug}`),

  getFeatured: () => request("/categories/featured"),

  // Add new category management functions
  create: (categoryData: any) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  update: (categoryId: number, categoryData: any) =>
    request(`/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  delete: (categoryId: number) =>
    request(`/categories/${categoryId}`, {
      method: "DELETE",
    }),

  addSubcategory: (categoryId: number, subcategoryData: any) =>
    request(`/categories/${categoryId}/subcategories`, {
      method: "POST",
      body: JSON.stringify(subcategoryData),
    }),

  updateSubcategory: (categoryId: number, subcategoryId: number, subcategoryData: any) =>
    request(`/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: "PUT",
      body: JSON.stringify(subcategoryData),
    }),

  deleteSubcategory: (categoryId: number, subcategoryId: number) =>
    request(`/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: "DELETE",
    }),
}

// Products API
export const productsApi = {
  getAll: (params: any = {}) => {
    const queryParams = new URLSearchParams()

    // Add all parameters to the query string
    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/products${queryString}`)
  },

  getById: (id: number) => request(`/products/${id}`),

  getTrending: () => request("/products/trending"),

  getRecommended: () => request("/products/recommended"),

  getRecentlyViewed: () => request("/products/recently-viewed"),

  getSimilar: (productId: number) => request(`/products/${productId}/similar`),

  getByCategory: (categoryId: number, params: any = {}) => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/categories/${categoryId}/products${queryString}`)
  },

  search: (query: string, params: any = {}) => {
    const queryParams = new URLSearchParams(params)
    queryParams.append("q", query)
    return request(`/products/search?${queryParams.toString()}`)
  },
}

// Cart API
export const cartApi = {
  getCart: () => request("/cart"),

  addItem: (productId: number, quantity: number) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (itemId: number, quantity: number) =>
    request(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: number) =>
    request(`/cart/items/${itemId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    request("/cart", {
      method: "DELETE",
    }),

  getWishlist: () => request("/users/wishlist"),

  addToWishlist: (productId: number) =>
    request("/users/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  removeFromWishlist: (productId: number) =>
    request(`/users/wishlist/${productId}`, {
      method: "DELETE",
    }),
}

// Reviews API
export const reviewsApi = {
  getByProduct: (productId: number) => request(`/products/${productId}/reviews`),

  addReview: (productId: number, reviewData: any) =>
    request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  markHelpful: (reviewId: number) =>
    request(`/reviews/${reviewId}/helpful`, {
      method: "POST",
    }),
}

// Order API
export const orderApi = {
  getOrders: (params: any = {}) => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/orders${queryString}`)
  },

  getOrderById: (orderId: number) => request(`/orders/${orderId}`),

  createOrder: (orderData: any) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  cancelOrder: (orderId: number) =>
    request(`/orders/${orderId}/cancel`, {
      method: "POST",
    }),
}

// Vendor API
export const vendorApi = {
  getProfile: () => request("/vendors/profile"),

  updateProfile: (profileData: any) =>
    request("/vendors/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  getProducts: (params: any = {}) => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/vendors/products${queryString}`)
  },

  addProduct: (productData: any) =>
    request("/vendors/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  updateProduct: (productId: number, productData: any) =>
    request(`/vendors/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  deleteProduct: (productId: number) =>
    request(`/vendors/products/${productId}`, {
      method: "DELETE",
    }),

  getOrders: (params: any = {}) => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/vendors/orders${queryString}`)
  },

  updateOrderStatus: (orderId: number, status: string) =>
    request(`/vendors/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}

// Admin API
export const adminApi = {
  getVendors: (params: any = {}) => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
      queryParams.append(key, params[key])
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return request(`/admin/vendors${queryString}`)
  },

  getVendorById: (vendorId: number) => request(`/admin/vendors/${vendorId}`),

  approveVendor: (vendorId: number) =>
    request(`/admin/vendors/${vendorId}/approve`, {
      method: "POST",
    }),
    getDashboard: () => request("/admin/dashboard"),

  rejectVendor: (vendorId: number, reason: string) =>
    request(`/admin/vendors/${vendorId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  getCategories: () => request("/admin/categories"),

  getCategoryById: (categoryId: number) => request(`/admin/categories/${categoryId}`),

  createCategory: (categoryData: any) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (categoryId: number, categoryData: any) =>
    request(`/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (categoryId: number) =>
    request(`/admin/categories/${categoryId}`, {
      method: "DELETE",
    }),
}

export { request }

// Mock user data
// Auth API
const authApi_real = {
  // Login function
  login: async (credentials: Record<string, string>) => {
    console.log("API login called with:", credentials)

    // In a real app, this would be an API call
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()
      console.log("Login response data:", data)
      return data
    } catch (error) {
      console.error("API login error:", error)
      throw error
    }
  },

  // Verify email function
  verifyEmail: async (token: string) => {
    // In a real app, this would be an API call
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

    try {
      const response = await fetch(`${apiUrl}/auth/verify-email?token=${token}`, {
        method: "GET",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Email verification failed")
      }

      return await response.json()
    } catch (error) {
      console.error("API verify email error:", error)
      throw error
    }
  },
}
