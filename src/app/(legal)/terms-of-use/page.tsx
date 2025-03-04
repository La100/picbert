export const metadata = {
  title: "Terms of Use | Faces Factory",
  description: "Terms of Use for Faces Factory - Understanding our service agreement",
}

export default function TermsOfUsePage() {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>Terms of Use</h1>
      <p className="text-muted-foreground">Last updated: March 2024</p>

      <section className="mt-8">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Faces Factory, you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>
      </section>

      <section className="mt-8">
        <h2>Use License</h2>
        <p>
          Faces Factory grants you a personal, non-exclusive, non-transferable, limited license to use
          the service as provided by Faces Factory, subject to these Terms.
        </p>
        <ul>
          <li>You must not use the service for any illegal purposes</li>
          <li>You must not modify or copy the materials</li>
          <li>You must not use the materials for any commercial purpose</li>
          <li>You must not attempt to decompile or reverse engineer any software</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>User Content</h2>
        <p>
          You retain all rights to any content you submit, post or display on or through the service.
          By submitting content to Faces Factory, you grant us a worldwide, non-exclusive,
          royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit,
          display and distribute such content.
        </p>
      </section>

      <section className="mt-8">
        <h2>Disclaimer</h2>
        <p>
          The materials on Faces Factory&apos;s service are provided on an &apos;as is&apos; basis. Faces Factory
          makes no warranties, expressed or implied, and hereby disclaims and negates all other
          warranties including, without limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual property or other
          violation of rights.
        </p>
      </section>

      <section className="mt-8">
        <h2>Limitations</h2>
        <p>
          In no event shall Faces Factory or its suppliers be liable for any damages (including,
          without limitation, damages for loss of data or profit, or due to business interruption)
          arising out of the use or inability to use the materials on Faces Factory&apos;s service.
        </p>
      </section>

      <section className="mt-8">
        <h2>Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:support@facesfactory.ai">support@facesfactory.ai</a>
        </p>
      </section>
    </div>
  )
} 