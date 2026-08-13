import { Metadata } from "next";
import Navigation from "@/components/landing-page/Navigation";
import HeroSection from "@/components/landing-page/HeroSection";
import FeatureWithImage from "@/components/landing-page/FeatureWithImage";
import Recipe from "@/components/landing-page/Recipe";
import Faqs from "@/components/landing-page/Faqs";
import Footer from "@/components/landing-page/Footer";
import { CookieConsent } from "@/components/ui/cookie-consent";

export const metadata: Metadata = {
  title: "Faces Factory",
  description:
    "Faces Factory is a platform for creating and sharing images with AI",
};

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigation />
      <HeroSection />
      <FeatureWithImage />
      <Recipe />
      <section
        id="pricing"
        className="w-full bg-muted py-24"
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="subHeading font-bold">Service temporarily paused</h2>
          <p className="subText mx-auto mt-4 max-w-2xl">
            Faces Factory is currently available in showcase mode. New accounts,
            subscriptions, and AI generations are temporarily unavailable.
          </p>
        </div>
      </section>
      <Faqs />

      <section className="w-full mt-16 py-16 bg-muted">
        <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="subHeading font-bold">
              Ready to upgrade you content?
            </h2>
            <p className="subText mt-4 text-center">
              Join thousands of users who are already creating amazing
              AI-generated images.
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              The application will return soon.
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <CookieConsent policyUrl="/privacy-policy" />
    </main>
  );
}
