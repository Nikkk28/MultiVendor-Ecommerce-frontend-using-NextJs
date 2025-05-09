"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X, Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { vendorApi } from "@/lib/vendor-api"

// Define the form schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  originalPrice: z
    .string()
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Original price must be a positive number",
    })
    .optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  inventory: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Inventory must be a non-negative number",
  }),
  // Images are handled separately
})

export default function AddProductPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Add a submit button state to show loading state during submission

  // Add this state at the top with other states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      subcategory: "",
      inventory: "0",
    },
  })

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "VENDOR")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Mock vendor approval status - in a real app, this would come from the API
  const approvalStatus = "APPROVED" // PENDING, APPROVED, REJECTED

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)

    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)

      // Validate file types
      const invalidFiles = selectedFiles.filter((file) => !file.type.startsWith("image/"))
      if (invalidFiles.length > 0) {
        setUploadError("Only image files are allowed")
        return
      }

      // Validate file size (max 5MB per file)
      const oversizedFiles = selectedFiles.filter((file) => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setUploadError("Images must be less than 5MB each")
        return
      }

      // Validate total number of images (max 5)
      if (images.length + selectedFiles.length > 5) {
        setUploadError("Maximum 5 images allowed")
        return
      }

      // Add new images
      setImages((prevImages) => [...prevImages, ...selectedFiles])

      // Create preview URLs
      const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    const newPreviewUrls = [...imagePreviewUrls]
    newPreviewUrls.splice(index, 1)
    setImagePreviewUrls(newPreviewUrls)
  }

  // Update the onSubmit function to use the isSubmitting state
  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsSubmitting(true)
    setUploadError(null)

    try {
      // Validate that at least one image is uploaded
      if (images.length === 0) {
        setUploadError("At least one product image is required")
        setIsSubmitting(false)
        return
      }

      // Convert string values to numbers where needed
      const productData = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
        category: values.category,
        subcategory: values.subcategory,
        inventory: Number(values.inventory),
        // Add any other fields needed by your API
      }

      // In a real implementation, you would first upload the images
      // and then include the image URLs in the product data
      // For now, we'll assume the API handles image uploads separately

      // Call the API to add the product
      await vendorApi.addProduct(productData)

      // Show success message and redirect
      toast({
        title: "Success",
        description: "Product added successfully!",
      })
      router.push("/vendor/products")
    } catch (error) {
      console.error("Failed to add product:", error)
      setUploadError("Failed to add product. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviewUrls])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (approvalStatus !== "APPROVED") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert className="mb-8 bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Approval Pending</AlertTitle>
          <AlertDescription>
            Your vendor account is currently under review. You'll be able to add products once approved.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/vendor/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Enter the details of your new product</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter product description" className="min-h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (₹) (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Set this if the product is on sale</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="home-kitchen">Home & Kitchen</SelectItem>
                          <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                          <SelectItem value="books">Books & Stationery</SelectItem>
                          <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subcategory" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="inventory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventory</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Number of items in stock</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Images Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Product Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload up to 5 images. First image will be used as the main product image.
                  </p>
                </div>

                {uploadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {/* Image Previews */}
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                      <div className="absolute inset-0">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs py-1 text-center">
                          Main Image
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Upload Button */}
                  {images.length < 5 && (
                    <label className="aspect-square border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        multiple={true}
                      />
                    </label>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                </p>
              </div>

              {/* Update the submit button to show loading state */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/vendor/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding Product..." : "Add Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
