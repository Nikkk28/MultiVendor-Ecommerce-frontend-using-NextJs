"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Vendor {
  id: number
  name: string
  logo: string
  rating: number
  specialty: string
  productCount: number
}

const vendors: Vendor[] = [
  {
    id: 1,
    name: "ElectroHub",
    logo: "/circuit-city-logo.png",
    rating: 4.8,
    specialty: "Best in Electronics",
    productCount: 1250,
  },
  {
    id: 2,
    name: "FashionFiesta",
    logo: "/elegant-fashion-logo.png",
    rating: 4.7,
    specialty: "Premium Clothing",
    productCount: 2340,
  },
  {
    id: 3,
    name: "HomeDecorPlus",
    logo: "/elegant-home-decor-logo.png",
    rating: 4.9,
    specialty: "Luxury Home Decor",
    productCount: 890,
  },
  {
    id: 4,
    name: "GadgetGalaxy",
    logo: "/modern-gadget-store.png",
    rating: 4.6,
    specialty: "Latest Tech Gadgets",
    productCount: 1120,
  },
  {
    id: 5,
    name: "BeautyBliss",
    logo: "/elegant-beauty-logo.png",
    rating: 4.8,
    specialty: "Premium Beauty Products",
    productCount: 1560,
  },
  {
    id: 6,
    name: "KitchenKingdom",
    logo: "/culinary-tools-emblem.png",
    rating: 4.7,
    specialty: "Kitchen Essentials",
    productCount: 980,
  },
]

export default function FeaturedVendors() {
  const [startIndex, setStartIndex] = useState(0)
  const itemsToShow = 4

  const nextVendors = () => {
    setStartIndex((prev) => (prev + itemsToShow >= vendors.length ? 0 : prev + itemsToShow))
  }

  const prevVendors = () => {
    setStartIndex((prev) => (prev - itemsToShow < 0 ? Math.max(0, vendors.length - itemsToShow) : prev - itemsToShow))
  }

  const visibleVendors = vendors.slice(startIndex, startIndex + itemsToShow)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Featured Sellers</h2>
          <p className="text-muted-foreground">Discover our top-rated vendors</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevVendors} disabled={startIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous vendors</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextVendors}
            disabled={startIndex + itemsToShow >= vendors.length}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next vendors</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleVendors.map((vendor) => (
          <Link href={`/vendor/${vendor.id}`} key={vendor.id}>
            <Card className="h-full vendor-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 mb-4">
                  <Image src={vendor.logo || "/placeholder.svg"} alt={vendor.name} fill className="object-contain" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(vendor.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : i < vendor.rating
                              ? "fill-yellow-400 text-yellow-400 fill-half"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm ml-1">{vendor.rating}</span>
                </div>
                <Badge variant="secondary" className="mb-2">
                  {vendor.specialty}
                </Badge>
                <p className="text-sm text-muted-foreground">{vendor.productCount} Products</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/vendors">
          <Button variant="outline">View All Sellers</Button>
        </Link>
      </div>
    </section>
  )
}
