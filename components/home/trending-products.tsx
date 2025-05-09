"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { productsApi, cartApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function TrendingProducts() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const itemsToShow = 4

  // Fetch trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true)
        const data = await productsApi.getTrending()
        setProducts(data)
      } catch (err) {
        console.error("Error fetching trending products:", err)
        setError("Failed to load trending products")
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [])

  // Handle navigation
  const nextProducts = () => {
    setStartIndex((prev) => (prev + itemsToShow >= products.length ? 0 : prev + itemsToShow))
  }

  const prevProducts = () => {
    setStartIndex((prev) => (prev - itemsToShow < 0 ? Math.max(0, products.length - itemsToShow) : prev - itemsToShow))
  }

  // Handle adding product to cart
  const handleAddToCart = async (productId: number) => {
    try {
      setAddingToCart(productId)
      await cartApi.addItem(productId, 1)
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      })
    } catch (err) {
      console.error("Error adding to cart:", err)
      toast({
        title: "Failed to add to cart",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  // Get visible products
  const visibleProducts = products.slice(startIndex, startIndex + itemsToShow)

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <p className="text-muted-foreground">Discover what's popular right now</p>
          </div>
        </div>
        <p className="text-red-500">{error}</p>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <p className="text-muted-foreground">Discover what's popular right now</p>
          </div>
        </div>
        <p className="text-muted-foreground">No trending products available at the moment.</p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Trending Products</h2>
          <p className="text-muted-foreground">Discover what's popular right now</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevProducts} disabled={startIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous products</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextProducts}
            disabled={startIndex + itemsToShow >= products.length}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next products</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product) => (
          <Card key={product.id} className="product-card">
            <div className="relative">
              <Link href={`/product/${product.id}`}>
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images?.[0] || "/placeholder.svg?height=400&width=600&query=product"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>

              {product.isOnSale && (
                <Badge className="absolute top-2 left-2 bg-primary">{product.discountPercentage}% OFF</Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              >
                <Heart className="h-4 w-4" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>

            <CardContent className="p-4">
              <Link href={`/vendor/${product.vendor.id}`}>
                <p className="text-xs text-muted-foreground hover:text-primary mb-1">{product.vendor.name}</p>
              </Link>

              <Link href={`/product/${product.id}`}>
                <h3 className="font-medium line-clamp-2 h-12 mb-1 hover:text-primary">{product.name}</h3>
              </Link>

              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < product.rating
                            ? "fill-yellow-400 text-yellow-400 fill-half"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs ml-1 text-muted-foreground">({product.reviewCount || 0})</span>
              </div>

              <div className="flex items-center">
                <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
                {product.originalPrice && (
                  <p className="text-sm text-muted-foreground line-through ml-2">
                    ₹{product.originalPrice.toLocaleString()}
                  </p>
                )}
                {product.isOnSale && (
                  <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                size="sm"
                disabled={product.inventory <= 0 || addingToCart === product.id}
                onClick={() => handleAddToCart(product.id)}
              >
                {addingToCart === product.id ? (
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/products">
          <Button variant="outline">View All Products</Button>
        </Link>
      </div>
    </section>
  )
}
