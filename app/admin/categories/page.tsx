"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { categoriesApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, ArrowUpDown, Eye, FolderPlus } from "lucide-react"

export default function AdminCategoriesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    featured: false,
  })
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch categories
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

    if (user && user.role === "ADMIN") {
      fetchCategories()
    }
  }, [user])

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle special cases
    if (sortField === "productCount") {
      aValue = a.productCount || 0
      bValue = b.productCount || 0
    } else if (sortField === "subcategories") {
      aValue = a.subcategories?.length || 0
      bValue = b.subcategories?.length || 0
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug when name changes
    if (name === "name") {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }))
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  // Handle subcategory form input change
  const handleSubcategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSubcategoryFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug when name changes
    if (name === "name") {
      setSubcategoryFormData((prev) => ({ ...prev, slug: generateSlug(value) }))
    }
  }

  // Validate form
  const validateForm = (data: typeof formData) => {
    const errors: Record<string, string> = {}

    if (!data.name.trim()) {
      errors.name = "Name is required"
    }

    if (!data.slug.trim()) {
      errors.slug = "Slug is required"
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (!data.description.trim()) {
      errors.description = "Description is required"
    }

    return errors
  }

  // Validate subcategory form
  const validateSubcategoryForm = (data: typeof subcategoryFormData) => {
    const errors: Record<string, string> = {}

    if (!data.name.trim()) {
      errors.name = "Name is required"
    }

    if (!data.slug.trim()) {
      errors.slug = "Slug is required"
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    return errors
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      featured: false,
    })
    setFormErrors({})
  }

  // Reset subcategory form
  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      name: "",
      slug: "",
      description: "",
    })
    setFormErrors({})
  }

  // Handle add category
  const handleAddCategory = async () => {
    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true)
        const newCategory = await categoriesApi.create(formData)
        setCategories([...categories, newCategory])
        setIsAddDialogOpen(false)
        resetForm()
        toast({
          title: "Category added",
          description: `Category "${formData.name}" has been added successfully.`,
        })
      } catch (err) {
        console.error("Error adding category:", err)
        toast({
          title: "Failed to add category",
          description: "An error occurred while adding the category. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handle edit category
  const handleEditCategory = async () => {
    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true)
        const updatedCategory = await categoriesApi.update(selectedCategory.id, formData)
        setCategories(categories.map((category) => (category.id === selectedCategory.id ? updatedCategory : category)))
        setIsEditDialogOpen(false)
        resetForm()
        toast({
          title: "Category updated",
          description: `Category "${formData.name}" has been updated successfully.`,
        })
      } catch (err) {
        console.error("Error updating category:", err)
        toast({
          title: "Failed to update category",
          description: "An error occurred while updating the category. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handle delete category
  const handleDeleteCategory = async () => {
    try {
      setIsSubmitting(true)
      await categoriesApi.delete(selectedCategory.id)
      setCategories(categories.filter((category) => category.id !== selectedCategory.id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Category deleted",
        description: `Category "${selectedCategory.name}" has been deleted successfully.`,
      })
    } catch (err) {
      console.error("Error deleting category:", err)
      toast({
        title: "Failed to delete category",
        description: "An error occurred while deleting the category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle add subcategory
  const handleAddSubcategory = async () => {
    const errors = validateSubcategoryForm(subcategoryFormData)
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        setIsSubmitting(true)
        const updatedCategory = await categoriesApi.addSubcategory(selectedCategory.id, subcategoryFormData)
        setCategories(categories.map((category) => (category.id === selectedCategory.id ? updatedCategory : category)))
        setIsSubcategoryDialogOpen(false)
        resetSubcategoryForm()
        toast({
          title: "Subcategory added",
          description: `Subcategory "${subcategoryFormData.name}" has been added successfully.`,
        })
      } catch (err) {
        console.error("Error adding subcategory:", err)
        toast({
          title: "Failed to add subcategory",
          description: "An error occurred while adding the subcategory. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Open edit dialog
  const openEditDialog = (category: any) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      featured: category.featured || false,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (category: any) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Open subcategory dialog
  const openSubcategoryDialog = (category: any) => {
    setSelectedCategory(category)
    resetSubcategoryForm()
    setIsSubcategoryDialogOpen(true)
  }

  if (authLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  if (!user || user.role !== "ADMIN") {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground mt-2">Manage categories for the MultiMart platform</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category for products in the store.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Electronics"
                />
                {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="electronics"
                />
                {formErrors.slug && <p className="text-sm text-destructive">{formErrors.slug}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Latest gadgets and electronic items"
                  rows={3}
                />
                {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="/electronics-category.png"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="featured" checked={formData.featured} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="featured">Featured category</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Showing {sortedCategories.length} categories. Click on column headers to sort.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="w-[250px]">
                        <button className="flex items-center" onClick={() => handleSort("name")}>
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center" onClick={() => handleSort("slug")}>
                          Slug
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">
                        <button className="flex items-center" onClick={() => handleSort("productCount")}>
                          Products
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">
                        <button className="flex items-center" onClick={() => handleSort("subcategories")}>
                          Subcategories
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCategories.length > 0 ? (
                      sortedCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell className="text-center">{category.productCount || 0}</TableCell>
                          <TableCell className="text-center">{category.subcategories?.length || 0}</TableCell>
                          <TableCell className="text-center">
                            {category.featured ? (
                              <Badge>Featured</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openSubcategoryDialog(category)}
                                title="Add Subcategory"
                              >
                                <FolderPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(category)}
                                title="Edit Category"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openDeleteDialog(category)}
                                title="Delete Category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.push(`/category/${category.slug}`)}
                                title="View Category"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No categories found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">Slug: {category.slug}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{category.productCount || 0} Products</p>
                          <p className="text-sm text-muted-foreground">
                            {category.subcategories?.length || 0} Subcategories
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{category.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between p-6 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSubcategoryDialog(category)}
                        className="flex items-center"
                      >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Add Subcategory
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                          title="Edit Category"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(category)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-4">Add your first category to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the details of this category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" name="slug" value={formData.slug} onChange={handleInputChange} />
              {formErrors.slug && <p className="text-sm text-destructive">{formErrors.slug}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
              {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input id="edit-image" name="image" value={formData.image} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="edit-featured" checked={formData.featured} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="edit-featured">Featured category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}". This action cannot be undone.
              {selectedCategory?.productCount > 0 && (
                <p className="mt-2 font-medium text-destructive">
                  Warning: This category contains {selectedCategory.productCount} products that will be affected.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
            <DialogDescription>Add a new subcategory to "{selectedCategory?.name}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subcategory-name">Name</Label>
              <Input
                id="subcategory-name"
                name="name"
                value={subcategoryFormData.name}
                onChange={handleSubcategoryInputChange}
                placeholder="Smartphones"
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory-slug">Slug</Label>
              <Input
                id="subcategory-slug"
                name="slug"
                value={subcategoryFormData.slug}
                onChange={handleSubcategoryInputChange}
                placeholder="smartphones"
              />
              {formErrors.slug && <p className="text-sm text-destructive">{formErrors.slug}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory-description">Description (Optional)</Label>
              <Textarea
                id="subcategory-description"
                name="description"
                value={subcategoryFormData.description}
                onChange={handleSubcategoryInputChange}
                placeholder="Latest smartphones and mobile devices"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Subcategory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
