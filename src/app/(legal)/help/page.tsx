export const metadata = {
  title: "Help | Faces Factory",
  description: "Get help and support for using Faces Factory",
}

export default function HelpPage() {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>Help & Support</h1>
      <p className="text-muted-foreground">Last updated: March 2024</p>

      <section className="mt-8">
        <h2>Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3>How do I get started?</h3>
            <p>Sign up for an account and follow our quick start guide to begin using Faces Factory.</p>
          </div>
          <div>
            <h3>What features are available?</h3>
            <p>Explore our comprehensive set of features including face generation, customization, and export options.</p>
          </div>
          <div>
            <h3>Need technical support?</h3>
            <p>Our technical support team is available to help you with any issues you may encounter.</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2>Contact Support</h2>
        <p>
          If you need additional help, please don't hesitate to contact our support team at{" "}
          <a href="mailto:support@facesfactory.ai">support@facesfactory.ai</a>
        </p>
      </section>
    </div>
  )
} 