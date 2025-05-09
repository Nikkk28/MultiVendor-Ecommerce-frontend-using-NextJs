"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Lazy load components
const FeaturedCategories = dynamic(() => import("@/components/home/featured-categories"), {
  loading: () => <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-lg"></div>,
  ssr: false,
})

// Client component wrapper for auth-dependent content
const HomeClient = () => {
  const { user } = useAuth()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 md:py-48 px-4 bg-[#050d1f] text-white">
        {user && user.role === "CUSTOMER" && (
          <Alert className="bg-primary/20 border-primary/30 mb-8 max-w-xl">
            <AlertDescription className="text-white text-lg">
              Welcome back, <span className="font-bold">{user.firstName}</span>!
            </AlertDescription>
          </Alert>
        )}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Shop from Vendors
          <br />
          Across the Country
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-4">
          Discover unique products from trusted vendors all in one place.
        </p>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10">
          Quality products, secure shopping, fast delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products">
            <Button size="lg" className="px-8 py-6 text-lg bg-[#4285F4] hover:bg-[#4285F4]/90">
              Shop Now
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10">
            Explore Vendors
          </Button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Categories</h2>
            <Link href="/categories" className="text-primary hover:underline flex items-center">
              View all categories
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
          <FeaturedCategories />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
            <Link href="/products" className="text-primary hover:underline flex items-center">
              View all products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/30 p-1 transition-all hover:border-border/80"
              >
                <div className="aspect-square w-full overflow-hidden rounded-md bg-muted/20"></div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-1">Premium Product {id}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Vendor Name</p>
                  <p className="font-bold">₹2,499</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Top Vendors</h2>
            <Link href="/vendors" className="text-primary hover:underline flex items-center">
              View all vendors
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/30 p-6 transition-all hover:border-border/80 text-center"
              >
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/20"></div>
                <h3 className="font-medium">Vendor Name {id}</h3>
                <p className="text-sm text-muted-foreground">120+ Products</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// Export the client component as the default export
export default function Home() {
  return <HomeClient />
}
