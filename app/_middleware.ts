import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the user from cookies (in a real app, this would be from JWT)
  const user = request.cookies.get("user")?.value

  // Parse the user if it exists
  let userData = null
  try {
    if (user) {
      userData = JSON.parse(user)
    }
  } catch (error) {
    console.error("Error parsing user data:", error)
  }

  // Get the path
  const path = request.nextUrl.pathname

  // Redirect based on user role and path
  if (userData) {
    const role = userData.role

    // Vendor trying to access customer pages
    if (role === "VENDOR" && (path === "/" || path.startsWith("/products") || path.startsWith("/categories"))) {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url))
    }

    // Admin trying to access customer pages
    if (role === "ADMIN" && (path === "/" || path.startsWith("/products") || path.startsWith("/categories"))) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // Customer trying to access vendor pages
    if (role === "CUSTOMER" && path.startsWith("/vendor")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Customer or vendor trying to access admin pages
    if ((role === "CUSTOMER" || role === "VENDOR") && path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else {
    // Unauthenticated users trying to access protected pages
    if (path.startsWith("/vendor") || path.startsWith("/admin") || path.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Continue with the request if no redirects are needed
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/products/:path*", "/categories/:path*", "/vendor/:path*", "/admin/:path*"],
}
