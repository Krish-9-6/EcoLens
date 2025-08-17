import type { Metadata } from "next";
import { Manrope, Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
import SessionProvider from "./auth/SessionProvider";
import { Toaster } from 'sonner'

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ecolens.com'),
  title: {
    default: "EcoLens - Trust Engine for Fashion Supply Chains",
    template: "%s | EcoLens"
  },
  description: "Transform fashion supply chains with blockchain-verified transparency. Map, verify, and reveal your product stories with EcoLens Digital Product Passports.",
  keywords: [
    "fashion supply chain",
    "blockchain transparency",
    "digital product passport",
    "sustainability tracking",
    "fashion transparency",
    "supply chain mapping",
    "blockchain verification",
    "sustainable fashion",
    "product traceability",
    "fashion industry transparency"
  ],
  authors: [{ name: "EcoLens" }],
  creator: "EcoLens",
  publisher: "EcoLens",
  openGraph: {
    title: "EcoLens - From Black Box to Crystal Clear",
    description: "The trust engine for the new era of fashion. Transform your supply chain with blockchain-verified transparency and Digital Product Passports.",
    type: "website",
    locale: "en_US",
    url: "https://ecolens.com",
    siteName: "EcoLens",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "EcoLens - Trust Engine for Fashion Supply Chains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoLens - From Black Box to Crystal Clear",
    description: "The trust engine for the new era of fashion. Transform your supply chain with blockchain-verified transparency.",
    images: ["/og-image.svg"],
    creator: "@ecolens",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark light" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://ecolens.com/#organization",
                  name: "EcoLens",
                  url: "https://ecolens.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://ecolens.com/logo.png",
                    width: 512,
                    height: 512
                  },
                  description: "Trust engine for fashion supply chains providing blockchain-verified transparency through Digital Product Passports",
                  foundingDate: "2024",
                  industry: "Fashion Technology",
                  sameAs: [
                    "https://twitter.com/ecolens",
                    "https://linkedin.com/company/ecolens"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://ecolens.com/#website",
                  url: "https://ecolens.com",
                  name: "EcoLens",
                  description: "Transform fashion supply chains with blockchain-verified transparency",
                  publisher: {
                    "@id": "https://ecolens.com/#organization"
                  },
                  inLanguage: "en-US"
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://ecolens.com/#software",
                  name: "EcoLens Platform",
                  description: "Blockchain-enabled Digital Product Passport platform for fashion supply chain transparency",
                  url: "https://ecolens.com",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web Browser",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: "Free demo available"
                  },
                  publisher: {
                    "@id": "https://ecolens.com/#organization"
                  }
                },
                {
                  "@type": "Product",
                  "@id": "https://ecolens.com/#product",
                  name: "Digital Product Passport",
                  description: "Blockchain-verified transparency solution for fashion products",
                  brand: {
                    "@id": "https://ecolens.com/#organization"
                  },
                  category: "Supply Chain Technology",
                  offers: {
                    "@type": "Offer",
                    availability: "https://schema.org/InStock",
                    description: "Enterprise solution for fashion brands"
                  }
                }
              ]
            })
          }}
        />
        {/* Global error handler for development */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('error', function(event) {
                  console.error('Global Error Handler:', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                  });
                });
                
                window.addEventListener('unhandledrejection', function(event) {
                  console.error('Unhandled Promise Rejection:', {
                    reason: event.reason,
                    promise: event.promise
                  });
                });
              `
            }}
          />
        )}
      </head>
      <body
        className={`${manrope.variable} ${sora.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionProvider>
           {children}
          {/* Sonner Toaster for toast notifications - positioned at the end for proper z-index */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand
            toastOptions={{
              duration: 5000,
              style: {
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
            }}
            theme="system" // Automatically switches between light/dark based on system preference
          />
        </SessionProvider>
      </body>
    </html>
  );
}
