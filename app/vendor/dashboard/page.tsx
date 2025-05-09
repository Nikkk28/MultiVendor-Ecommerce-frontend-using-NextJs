"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type VendorDashboardDto } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, Store, BarChart, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VendorDashboard() {
  const { user, isLoading, getVendorDetails } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<VendorDashboardDto | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "VENDOR")) {
      router.push("/login")
      return
    }

    // Get vendor details if user is logged in
    const fetchVendorDetails = async () => {
      if (user && user.role === "VENDOR") {
        try {
          setIsRefreshing(true)
          setError(null)
          const data = await getVendorDetails()
          if (data) {
            setDashboardData(data)
            console.log("Fetched vendor dashboard data:", data)
          } else {
            setError("Could not retrieve vendor dashboard data. Please try again later.")
          }
        } catch (error) {
          console.error("Error fetching vendor dashboard:", error)
          setError("Failed to fetch vendor dashboard. Please try again later.")
        } finally {
          setIsRefreshing(false)
        }
      }
    }

    fetchVendorDetails()

    // Set up a refresh interval to check for status updates
    const refreshInterval = setInterval(fetchVendorDetails, 60000) // Check every minute

    return () => {
      clearInterval(refreshInterval) // Clean up on unmount
    }
  }, [user, isLoading, router, getVendorDetails])

  const handleRefresh = async () => {
    if (user) {
      try {
        setIsRefreshing(true)
        setError(null)
        const data = await getVendorDetails()
        if (data) {
          setDashboardData(data)
          console.log("Refreshed vendor dashboard data:", data)
        } else {
          setError("Could not retrieve vendor dashboard data. Please try again later.")
        }
      } catch (error) {
        console.error("Error refreshing vendor dashboard:", error)
        setError("Failed to fetch vendor dashboard. Please try again later.")
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Get vendor profile and approval status from dashboard data
  const vendorProfile = dashboardData?.vendorProfile
  const approvalStatus = vendorProfile?.approvalStatus || "PENDING"

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>

      {error && (
        <Alert className="mb-8 bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {approvalStatus === "PENDING" && (
        <Alert className="mb-8 bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Approval Pending</AlertTitle>
          <AlertDescription>
            Your vendor account is currently under review. You'll be able to add products once approved.
          </AlertDescription>
        </Alert>
      )}

      {approvalStatus === "REJECTED" && (
        <Alert className="mb-8 bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Application Rejected</AlertTitle>
          <AlertDescription>
            Your vendor application has been rejected.
            {vendorProfile?.rejectionReason && ` Reason: ${vendorProfile.rejectionReason}`}
            Please contact support for more information.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.productCount || 0}</div>
            <p className="text-xs text-muted-foreground">Products in your store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.orderCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total orders received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +₹{dashboardData?.monthlyRevenue?.toLocaleString() || 0} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile?.rating || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Based on customer reviews</p>
          </CardContent>
        </Card>
      </div>

      {approvalStatus === "APPROVED" && (
        <div className="flex justify-end mb-8">
          <Link href="/vendor/products/add">
            <Button>Add New Product</Button>
          </Link>
        </div>
      )}

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="store">Store Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              {approvalStatus === "APPROVED" ? (
                <div className="space-y-4">
                  {dashboardData?.recentProducts && dashboardData.recentProducts.length > 0 ? (
                    dashboardData.recentProducts.map((product) => (
                      <div key={product.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{product.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">In stock: {product.inventory}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You haven't added any products yet. Click "Add New Product" to get started.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You'll be able to add products once your vendor account is approved.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage your customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {approvalStatus === "APPROVED" ? (
                <div className="space-y-4">
                  {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.total.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{order.itemCount} item(s)</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">You haven't received any orders yet.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You'll be able to manage orders once your vendor account is approved.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>View your store performance</CardDescription>
            </CardHeader>
            <CardContent>
              {approvalStatus === "APPROVED" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold">₹{dashboardData?.totalRevenue?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Current Month</p>
                      <p className="text-xl font-bold">₹{dashboardData?.monthlyRevenue?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Previous Month</p>
                      <p className="text-xl font-bold">₹{dashboardData?.previousMonthRevenue?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.monthlyRevenue && dashboardData?.previousMonthRevenue
                      ? dashboardData.monthlyRevenue > dashboardData.previousMonthRevenue
                        ? `Your revenue has increased by ${(((dashboardData.monthlyRevenue - dashboardData.previousMonthRevenue) / dashboardData.previousMonthRevenue) * 100).toFixed(1)}% compared to last month.`
                        : `Your revenue has decreased by ${(((dashboardData.previousMonthRevenue - dashboardData.monthlyRevenue) / dashboardData.previousMonthRevenue) * 100).toFixed(1)}% compared to last month.`
                      : "Detailed analytics will be available once you have more sales data."}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You'll be able to view analytics once your vendor account is approved.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>Manage your store information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">{vendorProfile?.storeName || "Your Store"}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {vendorProfile?.storeDescription || "No description available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vendorProfile?.storeAddress
                    ? `${vendorProfile.storeAddress.street}, ${vendorProfile.storeAddress.city}, ${vendorProfile.storeAddress.state}, ${vendorProfile.storeAddress.country} - ${vendorProfile.storeAddress.zipCode}`
                    : "No address available"}
                </p>
                <p className="text-sm text-muted-foreground">Specialty: {vendorProfile?.specialty || "General"}</p>
                <p className="text-sm text-muted-foreground">
                  Joined: {vendorProfile?.joinedDate ? new Date(vendorProfile.joinedDate).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Contact: {vendorProfile?.contactEmail || user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Phone: {vendorProfile?.contactPhone || user.phoneNumber || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
