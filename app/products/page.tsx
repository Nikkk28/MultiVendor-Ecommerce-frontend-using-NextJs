"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Filter, SlidersHorizontal } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { productsApi, categoriesApi, cartApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedVendors, setSelectedVendors] = useState<number[]>([])
  const [sortOption, setSortOption] = useState("featured")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  // Fetch products, categories, and vendors data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const params: any = {
          page: currentPage,
          size: pageSize,
          sort: getSortParam(sortOption),
        }

        if (searchQuery) params.search = searchQuery
        if (selectedCategories.length === 1) params.category = selectedCategories[0]
        if (inStockOnly) params.inStock = true
        if (onSaleOnly) params.onSale = true

        const productsData = await productsApi.getAll(params)
        setProducts(productsData.content || [])
        setTotalPages(productsData.totalPages || 1)

        // Fetch categories
        const categoriesData = await categoriesApi.getAll()
        setCategories(categoriesData)

        // Extract unique vendors from products
        const uniqueVendors = Array.from(new Set((productsData.content || []).map((p: any) => p.vendor.id))).map(
          (vendorId: any) => {
            const vendorProducts = (productsData.content || []).filter((p: any) => p.vendor.id === vendorId)
            return {
              id: vendorId,
              name: vendorProducts[0]?.vendor.name || "Unknown Vendor",
              count: vendorProducts.length,
            }
          },
        )

        setVendors(uniqueVendors)

        // Set initial price range based on product prices
        if ((productsData.content || []).length > 0) {
          const prices = (productsData.content || []).map((p: any) => p.price)
          const minPrice = Math.floor(Math.min(...prices))
          const maxPrice = Math.ceil(Math.max(...prices))
          setPriceRange([minPrice, maxPrice])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, pageSize, sortOption, searchQuery, selectedCategories, inStockOnly, onSaleOnly])

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

  // Convert sort option to API parameter
  const getSortParam = (option: string) => {
    switch (option) {
      case "price-low-high":
        return "price,asc"
      case "price-high-low":
        return "price,desc"
      case "rating":
        return "rating,desc"
      case "newest":
        return "createdAt,desc"
      default:
        return "featured,desc"
    }
  }

  // Apply client-side filters (for vendor filtering which might not be supported by the API)
  const filteredProducts = products.filter((product) => {
    // Apply vendor filter
    if (selectedVendors.length > 0 && !selectedVendors.includes(product.vendor.id)) {
      return false
    }

    // Apply price range filter (if not handled by API)
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }

    return true
  })

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
    setCurrentPage(0) // Reset to first page when changing filters
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
    setSelectedCategories([])
    setSelectedVendors([])
    setSortOption("featured")
    setInStockOnly(false)
    setOnSaleOnly(false)
    setCurrentPage(0)
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

      <Accordion type="multiple" defaultValue={["categories", "vendors"]}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">({category.productCount || 0})</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

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

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => {
                    setInStockOnly(checked as boolean)
                    setCurrentPage(0)
                  }}
                />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={onSaleOnly}
                  onCheckedChange={(checked) => {
                    setOnSaleOnly(checked as boolean)
                    setCurrentPage(0)
                  }}
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

  // Pagination controls
  const Pagination = () => (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block w-64 shrink-0">
            <Skeleton className="h-[600px] w-full" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(0) // Reset to first page when searching
            }}
            className="w-full max-w-xs"
          />
        </div>
      </div>

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
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Sort by:</span>
              <Select
                value={sortOption}
                onValueChange={(value) => {
                  setSortOption(value)
                  setCurrentPage(0) // Reset to first page when sorting
                }}
              >
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

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          {/* Pagination */}
          {totalPages > 1 && <Pagination />}
        </div>
      </div>
    </div>
  )
}
