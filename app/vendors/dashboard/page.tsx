"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VendorsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/vendor/dashboard")
  }, [router])

  return <div className="container mx-auto px-4 py-12">Redirecting...</div>
}
