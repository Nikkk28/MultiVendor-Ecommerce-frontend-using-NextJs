"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { vendorApi } from "@/lib/vendor-api"
import { toast } from "@/components/ui/use-toast"

// Remove this mock data
// const mockVendorProducts = [...]

export default function VendorProductsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // Add state for products
  const [products, setProducts] = useState<any[]>([])

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "VENDOR")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Add useEffect to fetch vendor products
  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (!user) return

      try {
        const data = await vendorApi.getProducts()
        setProducts(data.content || data)
      } catch (err) {
        console.error("Error fetching vendor products:", err)
        // You could add error state and handling here if needed
      }
    }

    if (user && user.role === "VENDOR") {
      fetchVendorProducts()
    }
  }, [user])

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "price-low-high":
          return a.price - b.price
        case "price-high-low":
          return b.price - a.price
        case "inventory-low-high":
          return a.inventory - b.inventory
        case "inventory-high-low":
          return b.inventory - a.inventory
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Update the handleDeleteProduct function to use the API
  const handleDeleteProduct = (id: number) => {
    setDeleteProductId(id)
    setIsDeleteDialogOpen(true)
  }

  // Update the confirmDeleteProduct function to use the API
  const confirmDeleteProduct = async () => {
    if (deleteProductId) {
      try {
        await vendorApi.deleteProduct(deleteProductId)
        setProducts(products.filter((product) => product.id !== deleteProductId))
        toast({
          title: "Product deleted",
          description: "The product has been successfully deleted",
        })
      } catch (err) {
        console.error("Error deleting product:", err)
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setDeleteProductId(null)
      }
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/vendor/products/add">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-[300px]"
          />
        </div>
        <div className="flex items-center w-full sm:w-auto">
          <span className="text-sm mr-2">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-low-high">Price (Low to High)</SelectItem>
              <SelectItem value="price-high-low">Price (High to Low)</SelectItem>
              <SelectItem value="inventory-low-high">Inventory (Low to High)</SelectItem>
              <SelectItem value="inventory-high-low">Inventory (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {product.inventory === 0 && (
                  <Badge
                    variant="outline"
                    className="absolute top-2 left-2 bg-destructive/10 text-destructive border-destructive/20"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium line-clamp-2">{product.name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/vendor/products/edit/${product.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={product.inventory > 0 ? "outline" : "secondary"}>
                    {product.inventory > 0 ? `In Stock: ${product.inventory}` : "Out of Stock"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search query" : "You haven't added any products yet"}
          </p>
          <Link href="/vendor/products/add">
            <Button>Add Your First Product</Button>
          </Link>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
