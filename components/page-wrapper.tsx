"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export default function PageWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldRender(true)
    }, 10) // micro-delay to prevent flicker

    return () => {
      clearTimeout(timeout)
      setShouldRender(false) // reset on route change
    }
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.985, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.985, y: -10, filter: "blur(6px)" }}
        transition={{
          duration: 0.45,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {shouldRender ? children : null}
      </motion.div>
    </AnimatePresence>
  )
}
