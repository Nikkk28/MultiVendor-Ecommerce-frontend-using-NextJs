"use client"
import { ReactNode, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface ScrollProviderProps {
  children: ReactNode
}

export default function ScrollProvider({ children }: ScrollProviderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return // SSR safety check

    gsap.registerPlugin(ScrollSmoother, ScrollTrigger)
    
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
    }) as ScrollSmoother

    return () => {
      smoother?.kill()
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}