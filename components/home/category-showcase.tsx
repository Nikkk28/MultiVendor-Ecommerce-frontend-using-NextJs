import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: number
  name: string
  image: string
  subcategories: string[]
  itemCount: number
}

const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    image: "/placeholder.svg?height=400&width=600&query=electronics category",
    subcategories: ["Smartphones", "Laptops", "Audio", "Cameras"],
    itemCount: 5240,
  },
  {
    id: 2,
    name: "Fashion",
    image: "/placeholder.svg?height=400&width=600&query=fashion category",
    subcategories: ["Men's Clothing", "Women's Clothing", "Footwear", "Accessories"],
    itemCount: 8760,
  },
  {
    id: 3,
    name: "Home & Kitchen",
    image: "/placeholder.svg?height=400&width=600&query=home and kitchen category",
    subcategories: ["Furniture", "Appliances", "Decor", "Kitchenware"],
    itemCount: 3980,
  },
  {
    id: 4,
    name: "Beauty & Personal Care",
    image: "/placeholder.svg?height=400&width=600&query=beauty and personal care category",
    subcategories: ["Skincare", "Makeup", "Haircare", "Fragrances"],
    itemCount: 4520,
  },
  {
    id: 5,
    name: "Books & Stationery",
    image: "/placeholder.svg?height=400&width=600&query=books and stationery category",
    subcategories: ["Fiction", "Non-Fiction", "Academic", "Art Supplies"],
    itemCount: 2890,
  },
  {
    id: 6,
    name: "Sports & Outdoors",
    image: "/placeholder.svg?height=400&width=600&query=sports and outdoors category",
    subcategories: ["Fitness", "Camping", "Sports Equipment", "Activewear"],
    itemCount: 3150,
  },
]

export default function CategoryShowcase() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <p className="text-muted-foreground">Browse our wide range of categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden category-card">
            <Link href={`/category/${category.name.toLowerCase()}`}>
              <div className="relative h-40">
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm">{category.itemCount.toLocaleString()} items</p>
                </div>
              </div>
            </Link>
            <CardContent className="p-4">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                {category.subcategories.map((sub, index) => (
                  <li key={index}>
                    <Link
                      href={`/category/${category.name.toLowerCase()}/${sub.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/category/${category.name.toLowerCase()}`}
                className="text-sm text-primary font-medium mt-2 inline-block hover:underline"
              >
                View All
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
