"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Filter, SlidersHorizontal, Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { categoriesApi, productsApi, cartApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedVendors, setSelectedVendors] = useState<number[]>([])
  const [sortOption, setSortOption] = useState("featured")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  // Fetch category and products data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)

        // Fetch category data
        const categoryData = await categoriesApi.getById(params.slug)
        setCategory(categoryData)

        // Fetch products for this category
        const productsData = await productsApi.getByCategory(categoryData.id)
        setProducts(productsData.content || productsData)

        // Extract unique vendors from products
        const uniqueVendors = Array.from(
          new Set(productsData.content?.map((p: any) => p.vendor.id) || productsData.map((p: any) => p.vendor.id)),
        ).map((vendorId: any) => {
          const vendorProducts =
            productsData.content?.filter((p: any) => p.vendor.id === vendorId) ||
            productsData.filter((p: any) => p.vendor.id === vendorId)
          return {
            id: vendorId,
            name: vendorProducts[0]?.vendor.name || "Unknown Vendor",
            count: vendorProducts.length,
          }
        })

        setVendors(uniqueVendors)

        // Set initial price range based on product prices
        if (productsData.content?.length > 0 || productsData.length > 0) {
          const prices = (productsData.content || productsData).map((p: any) => p.price)
          const minPrice = Math.floor(Math.min(...prices))
          const maxPrice = Math.ceil(Math.max(...prices))
          setPriceRange([minPrice, maxPrice])
        }
      } catch (err) {
        console.error("Error fetching category:", err)
        setError("Failed to load category data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [params.slug])

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

  // Apply filters and sorting
  const filteredProducts = products
    .filter((product) => {
      // Apply search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Apply subcategory filter
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory?.name)) {
        return false
      }

      // Apply vendor filter
      if (selectedVendors.length > 0 && !selectedVendors.includes(product.vendor.id)) {
        return false
      }

      // Apply price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      // Apply in stock filter
      if (inStockOnly && product.inventory <= 0) {
        return false
      }

      // Apply on sale filter
      if (onSaleOnly && !product.originalPrice) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return a.price - b.price
        case "price-high-low":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          // 'featured' - no specific sorting
          return 0
      }
    })

  // Toggle subcategory selection
  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory) ? prev.filter((c) => c !== subcategory) : [...prev, subcategory],
    )
  }

  // Toggle vendor selection
  const toggleVendor = (vendorId: number) => {
    setSelectedVendors((prev) => (prev.includes(vendorId) ? prev.filter((v) => v !== vendorId) : [...prev, vendorId]))
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    if (products.length > 0) {
      const prices = products.map((p) => p.price)
      const minPrice = Math.floor(Math.min(...prices))
      const maxPrice = Math.ceil(Math.max(...prices))
      setPriceRange([minPrice, maxPrice])
    } else {
      setPriceRange([0, 10000])
    }
    setSelectedSubcategories([])
    setSelectedVendors([])
    setSortOption("featured")
    setInStockOnly(false)
    setOnSaleOnly(false)
  }

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
          Reset All Filters
        </Button>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            max={priceRange[1] > 0 ? priceRange[1] : 10000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-6"
          />
          <div className="flex items-center justify-between">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["subcategories", "vendors"]}>
        {category?.subcategories?.length > 0 && (
          <AccordionItem value="subcategories">
            <AccordionTrigger>Subcategories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {category.subcategories.map((subcategory: any) => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcategory-${subcategory.id}`}
                      checked={selectedSubcategories.includes(subcategory.name)}
                      onCheckedChange={() => toggleSubcategory(subcategory.name)}
                    />
                    <label
                      htmlFor={`subcategory-${subcategory.id}`}
                      className="text-sm flex items-center justify-between w-full cursor-pointer"
                    >
                      <span>{subcategory.name}</span>
                      <span className="text-muted-foreground">({subcategory.productCount || 0})</span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {vendors.length > 0 && (
          <AccordionItem value="vendors">
            <AccordionTrigger>Vendors</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vendor-${vendor.id}`}
                      checked={selectedVendors.includes(vendor.id)}
                      onCheckedChange={() => toggleVendor(vendor.id)}
                    />
                    <label
                      htmlFor={`vendor-${vendor.id}`}
                      className="text-sm flex items-center justify-between w-full cursor-pointer"
                    >
                      <span>{vendor.name}</span>
                      <span className="text-muted-foreground">({vendor.count})</span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={onSaleOnly}
                  onCheckedChange={(checked) => setOnSaleOnly(checked as boolean)}
                />
                <label htmlFor="on-sale" className="text-sm cursor-pointer">
                  On Sale Only
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block h-64 bg-muted rounded"></div>
            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Category not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/categories")}>
          Back to Categories
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
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground mt-2">{category.description}</p>
      </div>

      {/* Subcategories Navigation */}
      {category.subcategories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.subcategories.map((subcategory: any) => (
            <Link
              key={subcategory.id}
              href={`/category/${category.slug}/${subcategory.slug}`}
              className="px-4 py-2 rounded-full border hover:bg-muted transition-colors"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <FilterSidebar />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down products based on your preferences</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Sort by:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Showing <span className="font-medium">{filteredProducts.length}</span> of{" "}
            <span className="font-medium">{products.length}</span> products
          </p>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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

                    {product.inventory <= 0 && (
                      <Badge
                        variant="outline"
                        className="absolute top-2 left-2 bg-destructive/10 text-destructive border-destructive/20"
                      >
                        Out of Stock
                      </Badge>
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
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs bg-green-50 text-green-700 border-green-200"
                        >
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
