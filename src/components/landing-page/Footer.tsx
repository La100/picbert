import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center border-t">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Faces Factory. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href="/terms-of-use">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="/privacy-policy">
          Privacy
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="/help">
          Get Help
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
