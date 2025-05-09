"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  id: number
  image: string
  title: string
  description: string
  ctaText: string
  ctaLink: string
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: "/vibrant-sale-haul.png",
    title: "Summer Sale",
    description: "Up to 50% off on all summer essentials",
    ctaText: "Shop Now",
    ctaLink: "/deals/summer-sale",
  },
  {
    id: 2,
    image: "/tech-display-banner.png",
    title: "Tech Bonanza",
    description: "Latest gadgets from top brands",
    ctaText: "Explore",
    ctaLink: "/category/electronics",
  },
  {
    id: 3,
    image: "/urban-chic-collection.png",
    title: "Fashion Week",
    description: "New arrivals from premium designers",
    ctaText: "View Collection",
    ctaLink: "/category/fashion",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 hero-slide ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 text-white">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">{slide.title}</h2>
              <p className="text-sm md:text-lg mb-4 md:mb-8 max-w-md">{slide.description}</p>
              <Link href={slide.ctaLink}>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  {slide.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
