"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { adminApi } from "@/lib/api"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Store, Package, ShoppingBag, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface PendingVendor {
  id: number
  userId: number
  storeName: string
  storeDescription: string
  city: string
  state: string
  appliedDate: string
}

interface AdminDashboardData {
  userCount: number
  newUsersThisMonth: number
  vendorCount: number
  pendingVendorCount: number
  productCount: number
  newProductsThisMonth: number
  orderCount: number
  newOrdersThisMonth: number
  totalRevenue: number
  monthlyRevenue: number
  categoryCount: number
  pendingVendors: PendingVendor[]
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([])
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [vendorToReject, setVendorToReject] = useState<PendingVendor | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === "ADMIN") {
        try {
          const data = await adminApi.getDashboard()
          setDashboardData(data)
          setPendingVendors(data.pendingVendors || [])
        } catch (err) {
          console.error("Failed to fetch admin dashboard:", err)
        }
      }
    }

    fetchData()
  }, [user])

  const handleApproveVendor = async (vendorId: number) => {
    try {
      await adminApi.approveVendor(vendorId)
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId))
      toast({
        title: "Vendor Approved",
        description: "Vendor has been approved successfully."
      })
    } catch (error) {
      console.error("Approve failed", error)
      toast({
        title: "Error",
        description: "Could not approve vendor.",
        variant: "destructive"
      })
    }
  }

  const openRejectionDialog = (vendor: PendingVendor) => {
    setVendorToReject(vendor)
    setRejectionReason("")
    setRejectionDialogOpen(true)
  }

  const confirmRejection = async () => {
    if (!vendorToReject) return
    try {
      await adminApi.rejectVendor(vendorToReject.id, rejectionReason)
      setPendingVendors(prev => prev.filter(v => v.id !== vendorToReject.id))
      toast({
        title: "Vendor Rejected",
        description: `${vendorToReject.storeName} has been rejected.`
      })
    } catch (error) {
      console.error("Reject failed", error)
      toast({
        title: "Error",
        description: "Could not reject vendor.",
        variant: "destructive"
      })
    } finally {
      setRejectionDialogOpen(false)
      setVendorToReject(null)
    }
  }

  if (isLoading || !dashboardData) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
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
            <div className="text-2xl font-bold">{dashboardData.userCount}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.newUsersThisMonth} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.vendorCount}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.pendingVendorCount} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productCount}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.newProductsThisMonth} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.orderCount}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.newOrdersThisMonth} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.categoryCount}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/admin/categories">
                <Button variant="link" className="h-auto p-0 text-xs">Manage Categories</Button>
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
                          <p className="text-sm text-muted-foreground">{vendor.city}, {vendor.state}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied: {new Date(vendor.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openRejectionDialog(vendor)}>
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApproveVendor(vendor.id)}>
                            <Check className="mr-1 h-4 w-4" /> Approve
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
              <Link href="/admin/categories">
                <Button>Manage Categories</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter a reason for rejecting <span className="font-medium">{vendorToReject?.storeName}</span>
            </p>
            <Input
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={confirmRejection} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
