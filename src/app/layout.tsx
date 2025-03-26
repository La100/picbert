import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";

const satoshi = localFont({
  src: [
    {
      path: '../fonts/WEB/fonts/Satoshi-Variable.woff2',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../fonts/WEB/fonts/Satoshi-VariableItalic.woff2',
      weight: '300 900',
      style: 'italic',
    }
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Faces Factory",
  description:
    "Faces Factory is a platform for creating realistic AI human content.",
  openGraph: {
    title: "Faces Factory",
    description: "Faces Factory is a platform for creating realistic AI human content.",
    images: [
      {
        url: "/best_collage.jpg",
        width: 1200,
        height: 630,
        alt: "Faces Factory Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faces Factory",
    description: "Faces Factory is a platform for creating realistic AI human content.",
    images: ["/best_collage.jpg"],
    creator: "@facesFactory",
  },
  icons: {
    icon: [
      {
        url: "/face-smile-logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={`${satoshi.className}  antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
        <GoogleAnalytics gaId="G-19WBL2CQBG" />
      </body>
    </html>
  );
}
