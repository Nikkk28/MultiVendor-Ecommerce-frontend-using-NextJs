"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Store, Package, ShoppingBag, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock pending vendors for admin dashboard
const mockPendingVendors = [
  {
    id: 2,
    storeName: "FashionFiesta",
    storeDescription: "Clothing and accessories",
    city: "Delhi",
    state: "Delhi",
    appliedDate: "April 24, 2023",
  },
  {
    id: 4,
    storeName: "HomeDecorPlus",
    storeDescription: "Home decor and furniture",
    city: "Bangalore",
    state: "Karnataka",
    appliedDate: "April 26, 2023",
  },
]

// Mock approved vendors for admin dashboard
const mockApprovedVendors = [
  {
    id: 1,
    storeName: "ElectroHub",
    storeDescription: "Electronics",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    id: 3,
    storeName: "GadgetGalaxy",
    storeDescription: "Tech gadgets",
    city: "Hyderabad",
    state: "Telangana",
  },
]

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [pendingVendors, setPendingVendors] = useState(mockPendingVendors)
  const [approvedVendors, setApprovedVendors] = useState(mockApprovedVendors)

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Handle vendor approval
  const handleApproveVendor = (vendorId: number) => {
    // Find the vendor to approve
    const vendorToApprove = pendingVendors.find((v) => v.id === vendorId)
    if (!vendorToApprove) return

    // Remove from pending and add to approved
    setPendingVendors(pendingVendors.filter((v) => v.id !== vendorId))
    setApprovedVendors([...approvedVendors, vendorToApprove])
  }

  // Handle vendor rejection
  const handleRejectVendor = (vendorId: number) => {
    // Remove from pending
    setPendingVendors(pendingVendors.filter((v) => v.id !== vendorId))
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+86 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedVendors.length}</div>
            <p className="text-xs text-muted-foreground">{pendingVendors.length} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,642</div>
            <p className="text-xs text-muted-foreground">+350 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">624</div>
            <p className="text-xs text-muted-foreground">+42 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/admin/categories">
                <Button variant="link" className="h-auto p-0 text-xs">
                  Manage Categories
                </Button>
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">Vendor Approvals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Vendor Approvals</CardTitle>
              <CardDescription>Review and approve vendor applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVendors.length > 0 ? (
                  pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{vendor.storeName}</p>
                          <p className="text-sm text-muted-foreground">{vendor.storeDescription}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.city}, {vendor.state}
                          </p>
                          <p className="text-sm text-muted-foreground">Applied: {vendor.appliedDate}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleRejectVendor(vendor.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center"
                            onClick={() => handleApproveVendor(vendor.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No pending vendor applications.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Approved Vendors</CardTitle>
              <CardDescription>Manage existing vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedVendors.map((vendor) => (
                  <div key={vendor.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.storeName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.storeDescription}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.city}, {vendor.state}
                        </p>
                      </div>
                      <Badge>Approved</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">User management interface will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Product management interface will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Order management interface will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Manage product categories and subcategories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add, edit, or remove product categories and subcategories to organize your store.
                </p>
                <Link href="/admin/categories">
                  <Button className="w-full sm:w-auto">Manage Categories</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
