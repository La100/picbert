import { Inter } from "next/font/google"
import "@/app/globals.css"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Link>
          <main className="max-w-3xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 