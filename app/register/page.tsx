"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { MOCK_USERS } from "@/lib/api"

// Define the form schema
const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    isDefault: z.boolean().default(false),
    // Vendor specific fields
    storeName: z.string().optional(),
    storeDescription: z.string().optional(),
    specialty: z.string().optional(),
    logo: z.string().optional(),
    // Store address fields
    storeStreet: z.string().optional(),
    storeCity: z.string().optional(),
    storeState: z.string().optional(),
    storeCountry: z.string().optional(),
    storeZipCode: z.string().optional(),
    // Use same address checkbox
    useSameAddress: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "VENDOR") {
        return !!data.storeName && !!data.storeDescription && !!data.specialty
      }
      return true
    },
    {
      message: "Store name, description, and specialty are required for vendors",
      path: ["storeName"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "VENDOR" && !data.useSameAddress) {
        return !!data.storeStreet && !!data.storeCity && !!data.storeState && !!data.storeCountry && !!data.storeZipCode
      }
      return true
    },
    {
      message: "All store address fields are required when not using the same address",
      path: ["storeStreet"],
    },
  )

// Define the type for form values
type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize the form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      role: "CUSTOMER",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      isDefault: false,
      storeName: "",
      storeDescription: "",
      specialty: "",
      logo: "",
      storeStreet: "",
      storeCity: "",
      storeState: "",
      storeCountry: "",
      storeZipCode: "",
      useSameAddress: true,
    },
  })

  // Watch the role field to conditionally render store details
  const role = form.watch("role")
  const useSameAddress = form.watch("useSameAddress")

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, we'll just create a data URL
      // In a real app, you would upload this to a server and get a URL back
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setLogoPreview(dataUrl)
        form.setValue("logo", dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare the data for API - structure it according to the required JSON format
      const userData: Record<string, any> = {
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          zipCode: values.zipCode,
          isDefault: values.isDefault,
        },
        role: values.role,
      }

      // Add vendor-specific fields if the role is VENDOR
      if (values.role === "VENDOR") {
        userData.storeName = values.storeName
        userData.storeDescription = values.storeDescription
        userData.specialty = values.specialty

        // Add logo if provided
        if (values.logo) {
          userData.logo = values.logo
        }

        // Set store address based on whether to use the same address
        userData.storeAddress = values.useSameAddress
          ? {
              street: values.street,
              city: values.city,
              state: values.state,
              country: values.country,
              zipCode: values.zipCode,
            }
          : {
              street: values.storeStreet,
              city: values.storeCity,
              state: values.storeState,
              country: values.storeCountry,
              zipCode: values.storeZipCode,
            }
      }

      console.log("Submitting registration data:", userData)

      // Call the register function from auth context
      const result = await register(userData)

      // Set success message
      setSuccess(result.message)

      // Short delay to show success message before redirecting
      setTimeout(() => {
        // If user data is returned, redirect based on role
        if (result.user) {
          if (result.user.role === "VENDOR") {
            router.push("/vendor/dashboard")
          } else if (result.user.role === "ADMIN") {
            router.push("/admin/dashboard")
          } else {
            router.push("/")
          }
        } else {
          // Fallback to login page if no user data
          router.push("/login?registered=true")
        }
      }, 1500)
    } catch (err) {
      console.error("Registration failed:", err)
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join MultiMart to start shopping or selling products</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 p-4 bg-muted rounded-md">
            <h3 className="text-lg font-medium mb-2">Test Accounts</h3>
            <p className="text-sm text-muted-foreground mb-2">You can use these accounts to test the application:</p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Customer:</strong> {MOCK_USERS.CUSTOMER.username} / {MOCK_USERS.CUSTOMER.password}
              </div>
              <div className="text-sm">
                <strong>Vendor:</strong> {MOCK_USERS.VENDOR.username} / {MOCK_USERS.VENDOR.password}
              </div>
              <div className="text-sm">
                <strong>Admin:</strong> {MOCK_USERS.ADMIN.username} / {MOCK_USERS.ADMIN.password}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="techqueen_emma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="emma.chen@techhaven.io" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Emma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Chen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="EmTech@2025!" {...field} />
                        </FormControl>
                        <FormDescription>At least 6 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="EmTech@2025!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select "Vendor" if you want to sell products</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street 11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Hyderabad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="TELANGANA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="INDIA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="500076" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="isDefault" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="isDefault">Set as default address</FormLabel>
                        <FormDescription>
                          This address will be used as your default shipping and billing address
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {role === "VENDOR" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Store Information</h3>

                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tech Haven" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cutting-edge gadgets and smart home solutions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Specialty</FormLabel>
                        <FormControl>
                          <Input placeholder="Smart Home & IoT Devices" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Logo</FormLabel>
                        <div className="flex flex-col space-y-3">
                          <div
                            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-primary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {logoPreview ? (
                              <div className="flex flex-col items-center">
                                <img
                                  src={logoPreview || "/placeholder.svg"}
                                  alt="Logo preview"
                                  className="w-32 h-32 object-contain mb-2"
                                />
                                <p className="text-sm text-muted-foreground">Click to change</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload logo</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Or enter a URL directly in the field below
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="https://cdn.techhaven.io/logos/tech-haven-logo.png"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value.startsWith("http")) {
                                  setLogoPreview(e.target.value)
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter a URL or upload an image for your store logo</FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="useSameAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id="useSameAddress" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="useSameAddress">Use same address for store</FormLabel>
                          <FormDescription>Use your personal address as the store address</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!useSameAddress && (
                    <div className="p-4 bg-muted/50 rounded-md space-y-4">
                      <h4 className="text-sm font-medium">Store Address</h4>

                      <FormField
                        control={form.control}
                        name="storeStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street 11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storeCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Hyderabad" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="storeState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="TELANGANA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storeCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="INDIA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="storeZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="500076" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
