"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package2,
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ShoppingCart,
  Heart,
  Package,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  // Update the navItems to be role-specific
  const navItems =
    user?.role === "CUSTOMER" || !user
      ? [
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: "Categories", href: "/categories" },
          { name: "Vendors", href: "/vendors" },
        ]
      : user?.role === "VENDOR"
        ? [
            { name: "Dashboard", href: "/vendor/dashboard" },
            { name: "My Products", href: "/vendor/products" },
            { name: "Orders", href: "/vendor/orders" },
            { name: "Add Product", href: "/vendor/products/add" },
          ]
        : [
            { name: "Dashboard", href: "/admin/dashboard" },
            { name: "Vendors", href: "/admin/vendors" },
            { name: "Users", href: "/admin/users" },
            { name: "Products", href: "/admin/products" },
          ]

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
  }

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "VENDOR":
        return "/vendor/dashboard" // Keep this as /vendor/dashboard for frontend routing
      case "ADMIN":
        return "/admin/dashboard"
      case "CUSTOMER":
      default:
        return "/customer/dashboard"
    }
  }

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <Package2 className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">MultiMart</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:flex relative">
              {isSearchOpen ? (
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-[300px] bg-background"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </div>

            {/* Theme Toggle - Using client component to avoid hydration mismatch */}
            <ThemeToggle />

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {/* Auth Buttons or User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/cart">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Cart</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "VENDOR" && (
                      <DropdownMenuItem asChild>
                        <Link href="/vendor/products/add">
                          <Store className="mr-2 h-4 w-4" />
                          <span>Add Product</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="border-b pb-4 mb-4">
                    <Input type="search" placeholder="Search products..." className="mb-4" />
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-lg font-medium transition-colors hover:text-primary ${
                          pathname === item.href ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto pt-4 border-t space-y-4">
                    {user ? (
                      <>
                        <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full flex items-center justify-start">
                            <User className="mr-2 h-4 w-4" />
                            My Account
                          </Button>
                        </Link>
                        <Button
                          className="w-full flex items-center justify-start"
                          onClick={() => {
                            logout()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">Register</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
