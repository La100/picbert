export const metadata = {
  title: "Privacy Policy | Faces Factory",
  description: "Privacy Policy for Faces Factory - Learn how we protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: March 2024</p>

      <section className="mt-8">
        <h2>Introduction</h2>
        <p>
          At Faces Factory, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our service.
        </p>
      </section>

      <section className="mt-8">
        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email address)</li>
          <li>Payment information</li>
          <li>Images and videos you upload</li>
          <li>Usage data and preferences</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our service</li>
          <li>Process your payments</li>
          <li>Send you updates and notifications</li>
          <li>Improve our services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data
          against unauthorized or unlawful processing, accidental loss, destruction, or damage.
        </p>
      </section>

      <section className="mt-8">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:support@facesfactory.ai">support@facesfactory.ai</a>
        </p>
      </section>
    </div>
  )
} 