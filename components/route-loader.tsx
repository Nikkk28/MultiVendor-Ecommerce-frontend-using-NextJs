"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export default function RouteLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 600) // duration of transition

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <motion.div
            className="h-12 w-12 rounded-full border-4 border-[#1ECBE1] border-t-transparent animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
