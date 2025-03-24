'use client'
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface CookieConsentProps {
  policyUrl?: string;
}

export function CookieConsent({ policyUrl = "/privacy-policy" }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Cookie Notice</h3>
            <p className="text-sm text-slate-600 mt-1">
              This website uses cookies to ensure you get the best experience. By continuing to browse 
              the site, you agree to our use of cookies in accordance with our{" "}
              <a href={policyUrl} className="underline hover:text-primary">
                privacy policy
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            Decline
          </Button>
          <Button size="sm" onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Cookie Notice</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              This website uses cookies to ensure you get the best experience. By continuing to browse 
              the site, you agree to our use of cookies in accordance with our{" "}
              <a href={policyUrl} className="underline hover:text-primary">
                privacy policy
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            Decline
          </Button>
          <Button size="sm" onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
} 