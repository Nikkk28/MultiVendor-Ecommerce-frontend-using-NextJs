"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnouncementBarProps {
  message: string
  endTime: Date
}

export default function AnnouncementBar({ message, endTime }: AnnouncementBarProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isVisible, setIsVisible] = useState<boolean>(true)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft("Offer ended")
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (!isVisible) return null

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center relative">
      <div className="container mx-auto flex items-center justify-center">
        <p className="text-sm font-medium">
          {message} | Ends in: <span className="font-bold">{timeLeft}</span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  )
}
