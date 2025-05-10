"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { customerApi } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, Heart, MapPin, User } from "lucide-react"

interface CustomerDashboardDto {
  orderCount: number
  recentOrders: {
    orderNumber: string
    createdAt: string
    total: number
    itemCount: number
    status: string
  }[]
  cartItems: number
  cartTotal: number
  wishlistCount: number
  savedAddressCount: number
}

export default function CustomerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<CustomerDashboardDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CUSTOMER")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await customerApi.getDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to fetch customer dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "CUSTOMER") {
      fetchDashboard()
    }
  }, [user])

  if (isLoading || loading || !dashboardData) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }

  const { orderCount, cartItems, cartTotal, wishlistCount, savedAddressCount, recentOrders } = dashboardData

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cart</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{cartTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{cartItems} items in cart</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistCount}</div>
            <p className="text-xs text-muted-foreground">Items saved for later</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedAddressCount}</div>
            <p className="text-xs text-muted-foreground">Delivery locations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and manage your recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No recent orders found.</p>}
                {recentOrders.map((order) => (
                  <div key={order.orderNumber} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Items you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You have {wishlistCount} items in your wishlist.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You have {savedAddressCount} saved addresses.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                    {/* {user?.address?.country}{user?.address?.state}{user?.address?.city}
                    {user?.address?.zipCode}{user?.address?.street} */}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                {/* <p className="text-sm text-muted-foreground">{user?.address?.country}</p>
                <p className="text-sm text-muted-foreground">{user?.address?.state}</p>
                <p className="text-sm text-muted-foreground">{user?.address?.city}</p>
                <p className="text-sm text-muted-foreground">{user?.address?.zipCode}</p>
                <p className="text-sm text-muted-foreground">{user?.address?.street}</p> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
