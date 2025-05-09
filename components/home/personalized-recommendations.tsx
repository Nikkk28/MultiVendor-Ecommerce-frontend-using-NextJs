"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { productsApi, cartApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function PersonalizedRecommendations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const itemsToShow = 4

  // Fetch personalized recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)

        // Fetch recently viewed products
        if (user) {
          try {
            const recentData = await productsApi.getRecentlyViewed()
            setRecentlyViewed(recentData)
          } catch (err) {
            console.error("Error fetching recently viewed products:", err)
            // Fallback to recommended products if recently viewed fails
            setRecentlyViewed([])
          }
        }

        // Fetch recommended products
        const recommendedData = await productsApi.getRecommended()
        setRecommended(recommendedData)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to load personalized recommendations")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user])

  // Handle navigation
  const nextProducts = (products: any[]) => {
    setStartIndex((prev) => (prev + itemsToShow >= products.length ? 0 : prev + itemsToShow))
  }

  const prevProducts = (products: any[]) => {
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

  // Render products
  const renderProducts = (products: any[]) => {
    if (products.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No products available.</p>
    }

    const visibleProducts = products.slice(startIndex, startIndex + itemsToShow)

    return (
      <div className="relative">
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

                <div className="flex items-center">
                  <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </p>
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

        {products.length > itemsToShow && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" size="icon" onClick={() => prevProducts(products)} disabled={startIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => nextProducts(products)}
              disabled={startIndex + itemsToShow >= products.length}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <section>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Personalized For You</h2>
          <p className="text-muted-foreground">Based on your browsing history</p>
        </div>
        <p className="text-red-500">{error}</p>
      </section>
    )
  }

  // If no recommendations are available, don't render the component
  if (recentlyViewed.length === 0 && recommended.length === 0) {
    return null
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Personalized For You</h2>
        <p className="text-muted-foreground">Based on your browsing history</p>
      </div>

      <Tabs defaultValue={recentlyViewed.length > 0 ? "recently-viewed" : "recommended"}>
        <TabsList className="mb-6">
          {recentlyViewed.length > 0 && <TabsTrigger value="recently-viewed">Recently Viewed</TabsTrigger>}
          <TabsTrigger value="recommended">Recommended For You</TabsTrigger>
        </TabsList>
        {recentlyViewed.length > 0 && (
          <TabsContent value="recently-viewed">{renderProducts(recentlyViewed)}</TabsContent>
        )}
        <TabsContent value="recommended">{renderProducts(recommended)}</TabsContent>
      </Tabs>
    </section>
  )
}
