"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categoriesApi } from "@/lib/api"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await categoriesApi.getAll()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">Categories</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shop by Category</h1>
            <p className="text-muted-foreground mt-2">Browse our wide range of product categories</p>
          </div>
          <div className="w-full md:w-auto">
            <Input placeholder="Search categories..." className="max-w-xs" disabled />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden h-full">
              <div className="relative h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shop by Category</h1>
            <p className="text-muted-foreground mt-2">Browse our wide range of product categories</p>
          </div>
        </div>
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
        <span className="text-foreground font-medium">Categories</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop by Category</h1>
          <p className="text-muted-foreground mt-2">Browse our wide range of product categories</p>
        </div>
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Link href={`/category/${category.slug}`} key={category.id}>
              <Card className="overflow-hidden h-full hover:border-primary transition-colors">
                <div className="relative h-48">
                  <Image
                    src={category.image || "/placeholder.svg?height=400&width=600&query=category"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                  {category.featured && <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>}
                </div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.productCount.toLocaleString()} Products</span>
                    <span className="text-sm text-primary">{category.subcategories?.length || 0} Subcategories</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search query</p>
        </div>
      )}
    </div>
  )
}
