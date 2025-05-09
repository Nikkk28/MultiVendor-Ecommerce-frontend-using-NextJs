"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  ShoppingCart,
  Star,
  Share2,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Store,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { productsApi, cartApi, reviewsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        // Fetch product details
        const productData = await productsApi.getById(Number(params.id))
        setProduct(productData)

        // Set initial quantity
        setQuantity(1)

        // Fetch similar products
        const similar = await productsApi.getSimilar(Number(params.id))
        setSimilarProducts(similar)

        // Check if product is in wishlist
        if (user) {
          try {
            const wishlist = await cartApi.getWishlist()
            setInWishlist(wishlist.some((item: any) => item.productId === Number(params.id)))
          } catch (err) {
            console.error("Error fetching wishlist:", err)
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, user])

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (product && quantity < product.inventory) {
      setQuantity(quantity + 1)
    }
  }

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    try {
      await cartApi.addItem(product.id, quantity)
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity > 1 ? "items" : "item"} added to your cart`,
      })
    } catch (err) {
      console.error("Error adding to cart:", err)
      toast({
        title: "Failed to add to cart",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  // Handle add to wishlist
  const handleToggleWishlist = async () => {
    if (!product) return

    try {
      if (inWishlist) {
        await cartApi.removeFromWishlist(product.id)
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist",
        })
      } else {
        await cartApi.addToWishlist(product.id)
        toast({
          title: "Added to wishlist",
          description: "Product has been added to your wishlist",
        })
      }

      // Toggle wishlist state
      setInWishlist(!inWishlist)
    } catch (err) {
      console.error("Error updating wishlist:", err)
      toast({
        title: "Failed to update wishlist",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push("/login")
      return
    }

    if (!product) return

    try {
      setSubmittingReview(true)
      await reviewsApi.addReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewText,
      })

      // Reset form
      setReviewText("")
      setReviewRating(5)
      setReviewTitle("")

      // Refresh product data to get updated reviews
      const updatedProduct = await productsApi.getById(product.id)
      setProduct(updatedProduct)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })
    } catch (err) {
      console.error("Error submitting review:", err)
      toast({
        title: "Failed to submit review",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  // Handle mark review as helpful
  const handleMarkHelpful = async (reviewId: number) => {
    if (!product) return

    try {
      await reviewsApi.markHelpful(reviewId)

      // Refresh product data to get updated reviews
      const updatedProduct = await productsApi.getById(product.id)
      setProduct(updatedProduct)

      toast({
        title: "Review marked as helpful",
        description: "Thank you for your feedback!",
      })
    } catch (err) {
      console.error("Error marking review as helpful:", err)
      toast({
        title: "Failed to update review",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-24 bg-muted rounded w-full"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
        {product.subcategory && (
          <>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link
              href={`/category/${product.category.slug}/${product.subcategory.slug}`}
              className="hover:text-primary"
            >
              {product.subcategory.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.images?.[selectedImage] || "/placeholder.svg?height=600&width=600&query=product"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className={`relative aspect-square overflow-hidden rounded-md border cursor-pointer ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg?height=150&width=150&query=product thumbnail"}
                    alt={`${product.name} - view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Link href={`/vendor/${product.vendor.id}`} className="text-sm text-primary hover:underline">
              {product.vendor.name}
            </Link>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : i < product.rating
                        ? "fill-yellow-400 text-yellow-400 fill-half"
                        : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span>
          </div>

          <div className="flex items-center">
            <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through ml-2">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.isOnSale && <Badge className="ml-2 bg-green-500">{product.discountPercentage}% OFF</Badge>}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center">
              <Badge variant={product.inventory > 0 ? "outline" : "secondary"} className="mr-2">
                {product.inventory > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.inventory > 0 && (
                <span className="text-sm text-muted-foreground">{product.inventory} available</span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || product.inventory <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.inventory || product.inventory <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button className="flex-1" onClick={handleAddToCart} disabled={product.inventory <= 0 || addingToCart}>
                {addingToCart ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={inWishlist ? "text-red-500 hover:text-red-500" : ""}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500" : ""}`} />
                <span className="sr-only">{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
              </Button>

              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free delivery on orders over ₹500</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">30-day easy returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">1 year warranty</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              Sold by{" "}
              <Link href={`/vendor/${product.vendor.id}`} className="text-primary hover:underline">
                {product.vendor.name}
              </Link>{" "}
              ({product.vendor.rating?.toFixed(1) || "N/A"} ★)
            </span>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="mb-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <div className="prose max-w-none dark:prose-invert">
            <p className="text-lg">{product.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="specifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications?.map((spec: { name: string; value: string }, index: number) => (
              <div key={index} className="flex justify-between p-3 border rounded-md">
                <span className="font-medium">{spec.name}</span>
                <span className="text-muted-foreground">{spec.value}</span>
              </div>
            )) || <p className="text-muted-foreground">No specifications available for this product.</p>}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-8">
          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 flex flex-col items-center justify-center space-y-2">
              <span className="text-5xl font-bold">{product.rating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : i < product.rating
                          ? "fill-yellow-400 text-yellow-400 fill-half"
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Based on {product.reviewCount || 0} reviews</span>
            </div>

            <div className="col-span-2">
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.reviews?.filter((r: any) => Math.floor(r.rating) === rating).length || 0
                  const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm w-2">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Write a Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="review-title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-text" className="text-sm font-medium">
                    Review
                  </label>
                  <Textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            ) : (
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">
                  Please{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    log in
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Reviews List */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Customer Reviews</h3>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.user.name || review.user.username}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-green-500 border-green-200">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-sm mt-1">{review.comment}</p>
                    </div>

                    <div className="flex items-center space-x-4 pt-2">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpfulCount || 0})
                      </button>
                      <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="space-y-6 mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Similar Products</h2>
            {product.category && (
              <Link href={`/category/${product.category.slug}`} className="text-primary hover:underline">
                View All
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
