export const metadata = {
  title: "About | Faces Factory",
  description: "Learn about Faces Factory - The future of AI-powered face generation",
}

export default function AboutPage() {
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
      <h1>About Faces Factory</h1>

      <section className="mt-8">
        <h2>Our Mission</h2>
        <p>
          At Faces Factory, we&apos;re revolutionizing the way digital content creators work with AI-generated
          faces. Our mission is to provide cutting-edge AI technology that enables creators to generate
          high-quality, realistic faces for their projects while maintaining ethical standards and
          respecting privacy.
        </p>
      </section>

      <section className="mt-8">
        <h2>What We Do</h2>
        <p>
          We specialize in AI-powered face generation technology that allows you to:
        </p>
        <ul>
          <li>Create high-quality, realistic AI-generated faces</li>
          <li>Generate consistent faces across multiple images</li>
          <li>Create short video sequences with AI-generated faces</li>
          <li>Customize and fine-tune the generated results</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>Our Technology</h2>
        <p>
          Our platform utilizes state-of-the-art artificial intelligence and machine learning
          technologies to generate highly realistic faces. We continuously improve our algorithms
          to provide the best possible results while ensuring ethical use of AI technology.
        </p>
      </section>

      <section className="mt-8">
        <h2>Our Values</h2>
        <ul>
          <li>
            <strong>Innovation:</strong> We&apos;re constantly pushing the boundaries of what&apos;s possible
            with AI technology
          </li>
          <li>
            <strong>Ethics:</strong> We&apos;re committed to the responsible development and use of AI
            technology
          </li>
          <li>
            <strong>Privacy:</strong> We prioritize user privacy and data protection in everything
            we do
          </li>
          <li>
            <strong>Quality:</strong> We strive to provide the highest quality results for our users
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>Contact Us</h2>
        <p>
          Have questions or want to learn more about Faces Factory? Contact us at{" "}
          <a href="mailto:support@facesfactory.ai">support@facesfactory.ai</a>
        </p>
      </section>
    </div>
  )
} 