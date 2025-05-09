import type React from "react"
import Image from "next/image"
import { Shield, Truck, RotateCcw, Clock, CreditCard } from "lucide-react"

interface TrustSignal {
  icon: React.ReactNode
  title: string
  description: string
}

const trustSignals: TrustSignal[] = [
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Secure Shopping",
    description: "100% Protected Payments",
  },
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Fast Delivery",
    description: "Across India",
  },
  {
    icon: <RotateCcw className="h-8 w-8 text-primary" />,
    title: "Easy Returns",
    description: "15 Day Return Policy",
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "24/7 Support",
    description: "Dedicated Customer Service",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: "Flexible Payment",
    description: "Multiple Payment Options",
  },
]

export default function TrustSignals() {
  return (
    <section className="py-8 border-t border-b">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Why Shop With Us</h2>
        <p className="text-muted-foreground">Trusted by over 1 million customers across India</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {trustSignals.map((signal, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-3">{signal.icon}</div>
            <h3 className="font-medium mb-1">{signal.title}</h3>
            <p className="text-sm text-muted-foreground">{signal.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center items-center gap-8">
        <Image src="/stylized-payment-card.png" alt="Visa" width={80} height={40} />
        <Image src="/interlocking-circles.png" alt="Mastercard" width={80} height={40} />
        <Image src="/rupay-logo-abstract.png" alt="RuPay" width={80} height={40} />
        <Image src="/digital-wallet-icon.png" alt="Paytm" width={80} height={40} />
        <Image src="/unified-payments-interface.png" alt="UPI" width={80} height={40} />
        <Image
          src="/placeholder.svg?height=40&width=80&query=amazon pay logo"
          alt="Amazon Pay"
          width={80}
          height={40}
        />
        <Image
          src="/placeholder.svg?height=40&width=80&query=google pay logo"
          alt="Google Pay"
          width={80}
          height={40}
        />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">10,000+</span> Sellers |
          <span className="font-semibold text-foreground"> 1M+</span> Happy Customers |
          <span className="font-semibold text-foreground"> 5M+</span> Products
        </p>
      </div>
    </section>
  )
}
