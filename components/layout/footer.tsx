import Link from "next/link"
import { Package2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Package2 className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">MultiMart</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              MultiMart is India's leading multi-vendor marketplace connecting buyers with thousands of sellers across
              the country.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-sm text-muted-foreground hover:text-primary">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/become-seller" className="text-sm text-muted-foreground hover:text-primary">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">123 Commerce Street, Bangalore, Karnataka, India</li>
              <li className="text-sm text-muted-foreground">support@multimart.com</li>
              <li className="text-sm text-muted-foreground">+91 1234567890</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} MultiMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
