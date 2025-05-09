interface Category {
  id: number
  name: string
  slug: string
  image: string
  productCount: number
  featured: boolean
}

const featuredCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "/placeholder.svg?key=z6u3g",
    productCount: 5240,
    featured: true,
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    image: "/placeholder.svg?key=aijcl",
    productCount: 8760,
    featured: true,
  },
  {
    id: 3,
    name: "Home & Kitchen",
    slug: "home-kitchen",\
    image: "/placeholder.svg?height=400&

```typescriptreact file="components/home/category-grid.tsx"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: number
  name: string
  slug: string
  image: string
  productCount: number
  featured: boolean
}

const featuredCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "/placeholder.svg?key=z6u3g",
    productCount: 5240,
    featured: true,
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    image: "/placeholder.svg?key=aijcl",
    productCount: 8760,
    featured: true,
  },
  {
    id: 3,
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: "/placeholder.svg?key=bnvs2",
    productCount: 3980,
    featured: true,
  },
  {
    id: 4,
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    image: "/placeholder.svg?key=9rlkm",
    productCount: 4520,
    featured: true,
  },
  {
    id: 5,
    name: "Books & Stationery",
    slug: "books-stationery",
    image: "/placeholder.svg?key=qw3rt",
    productCount: 2890,
    featured: false,
  },
  {
    id: 6,
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image: "/placeholder.svg?key=asdfg",
    productCount: 3150,
    featured: false,
  },
]

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredCategories.map((category) => (
        <Link href={`/category/${category.slug}`} key={category.id}>
          <Card className="overflow-hidden h-full hover:border-primary transition-colors">
            <div className="relative h-48">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover"
              />
              {category.featured && (
                <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="text-sm">{category.productCount.toLocaleString()} items</p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Explore Collection</span>
                <span className="text-sm text-primary">View All</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
