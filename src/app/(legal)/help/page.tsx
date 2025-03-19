import { Metadata } from "next"
import { ContactForm } from "@/components/contact/ContactForm"


export const metadata: Metadata = {
  title: "Contact Us | Faces Factory",
  description: "Get in touch with Faces Factory support team",
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Contact Support</h1>
        
        <div className="bg-card p-6 rounded-lg border">
          <p className="mb-6 text-muted-foreground">
            Our support team is here to help. Fill out the form below, and we&apos;ll get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  )
} 