export const metadata = {
  title: "Privacy Policy | Faces Factory",
  description: "Privacy Policy for Faces Factory - Learn how we handle and protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: March 2024</p>

      <section className="mt-8">
        <h2>1. Introduction</h2>
        <p>
          At Faces Factory, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our AI-powered face generation
          service. Please read this privacy policy carefully. If you do not agree with the terms of this
          privacy policy, please do not access the service.
        </p>
      </section>

      <section className="mt-8">
        <h2>2. Information We Collect</h2>
        <h3>2.1. Personal Information</h3>
        <p>We collect the following types of personal information:</p>
        <ul>
          <li>Account information (email address, username, password)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Profile information (if provided)</li>
          <li>Usage data and preferences</li>
          <li>Images and content you upload or generate</li>
        </ul>

        <h3 className="mt-4">2.2. Technical Information</h3>
        <p>We automatically collect certain information when you visit our service:</p>
        <ul>
          <li>IP address and location data</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Usage patterns and interactions</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>3. How We Use Your Information</h2>
        <p>We use your information for the following purposes:</p>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To process your payments and subscriptions</li>
          <li>To generate AI-based face images based on your inputs</li>
          <li>To improve our AI algorithms and service quality</li>
          <li>To communicate with you about service updates</li>
          <li>To prevent fraud and ensure security</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>4. Legal Basis for Processing (GDPR)</h2>
        <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
        <ul>
          <li>Contract fulfillment - to provide our service to you</li>
          <li>Legal obligation - to comply with applicable laws</li>
          <li>Legitimate interests - to improve our service and ensure security</li>
          <li>Consent - where specifically requested</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>5. Data Sharing and Third Parties</h2>
        <p>We share your information with the following third parties:</p>
        <ul>
          <li>Stripe - for payment processing</li>
          <li>Supabase - for database and authentication services</li>
          <li>Cloud service providers - for hosting and storage</li>
          <li>Analytics providers - to improve our service</li>
        </ul>
        <p>
          We ensure that all third-party service providers comply with data protection regulations
          and maintain appropriate security measures.
        </p>
      </section>

      <section className="mt-8">
        <h2>6. Data Retention</h2>
        <p>
          We retain your personal data for as long as necessary to provide our service and comply
          with legal obligations. Specifically:
        </p>
        <ul>
          <li>Account information - retained while your account is active</li>
          <li>Generated images - stored according to your subscription plan</li>
          <li>Payment information - retained as required by law</li>
          <li>Usage data - retained for service improvement (anonymized)</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your data:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication</li>
          <li>Secure data centers and backup systems</li>
          <li>Employee training on data protection</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>8. Your Data Protection Rights</h2>
        <p>Under GDPR and applicable laws, you have the following rights:</p>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to rectification of inaccurate data</li>
          <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
          <li>Right to withdraw consent</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>9. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to improve your experience:
        </p>
        <ul>
          <li>Essential cookies - required for service functionality</li>
          <li>Analytics cookies - to understand usage patterns</li>
          <li>Preference cookies - to remember your settings</li>
        </ul>
        <p>
          You can control cookie settings through your browser preferences.
        </p>
      </section>

      <section className="mt-8">
        <h2>10. International Data Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
          We ensure appropriate safeguards are in place through:
        </p>
        <ul>
          <li>Standard contractual clauses</li>
          <li>Data processing agreements</li>
          <li>Adequacy decisions where applicable</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>11. Children&apos;s Privacy</h2>
        <p>
          Our service is not intended for users under the age of 16. We do not knowingly collect
          personal information from children. If you become aware that a child has provided us
          with personal information, please contact us.
        </p>
      </section>

      <section className="mt-8">
        <h2>12. Changes to Privacy Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes
          by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
          Continued use of our service after such changes constitutes your acceptance of the new policy.
        </p>
      </section>

      <section className="mt-8">
        <h2>13. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your data protection
          rights, please contact us at:{" "}
          <a href="mailto:privacy@facesfactory.ai">privacy@facesfactory.ai</a>
        </p>
        <p>
          Data Protection Officer (DPO):<br />
          Email: <a href="mailto:dpo@facesfactory.ai">dpo@facesfactory.ai</a>
        </p>
      </section>
    </div>
  )
} 