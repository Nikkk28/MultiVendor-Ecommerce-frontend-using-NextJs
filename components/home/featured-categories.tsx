import Link from "next/link"

interface Category {
  id: number
  name: string
  productCount: number
  slug: string
}

const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    productCount: 5240,
    slug: "electronics",
  },
  {
    id: 2,
    name: "Fashion",
    productCount: 8760,
    slug: "fashion",
  },
  {
    id: 3,
    name: "Home & Kitchen",
    productCount: 3980,
    slug: "home-kitchen",
  },
  {
    id: 4,
    name: "Beauty & Personal Care",
    productCount: 4520,
    slug: "beauty-personal-care",
  },
  {
    id: 5,
    name: "Books & Stationery",
    productCount: 2890,
    slug: "books-stationery",
  },
  {
    id: 6,
    name: "Sports & Outdoors",
    productCount: 3150,
    slug: "sports-outdoors",
  },
]

export default function FeaturedCategories() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link href={`/category/${category.slug}`} key={category.id}>
          <div className="category-card group relative overflow-hidden rounded-lg border border-border/40 bg-card/30 p-6 transition-all hover:border-border/80">
            <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.productCount.toLocaleString()} products</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
