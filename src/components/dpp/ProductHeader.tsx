"use client"

import Image from "next/image";
import { Card, CardContent } from "<ecolens>/components/ui/card";
import { Share2, Printer, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type ProductHeaderProps = {
  productName: string;
  brandName: string;
  imageUrl?: string;
  verifiedCount?: number;
  totalCertificates?: number;
  brandAvatarUrl?: string;
  className?: string;
}

export function ProductHeader({
  productName,
  brandName,
  imageUrl,
  verifiedCount,
  totalCertificates,
  brandAvatarUrl,
  className,
}: ProductHeaderProps) {
  // Generate fallback initials from product or brand name
  const getInitials = (name: string) => {
    const words = name.split(" ").filter((w) => w.length > 0);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();
  };

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title: productName, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* noop */
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const verificationText =
    verifiedCount !== undefined && totalCertificates !== undefined
      ? `${verifiedCount} of ${totalCertificates} verified`
      : undefined;

  return (
    <Card className={twMerge(clsx("w-full", className))}>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-6 items-start">
          {/* Product Image (square) */}
          <div className="relative w-full md:w-[240px] aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-green-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${productName} product image`}
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-700"
                role="img"
                aria-label={`${productName} product placeholder`}
              >
                {getInitials(productName)}
              </div>
            )}

            {/* Glassmorphism brand strip */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                  {brandAvatarUrl ? (
                    <Image src={brandAvatarUrl} alt={`${brandName} logo`} fill className="object-cover" />
                  ) : (
                    getInitials(brandName)
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">{brandName}</span>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {productName}
            </h1>
            {verificationText && (
              <div className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {verificationText}
              </div>
            )}
            <p className="text-gray-600 text-sm md:text-base max-w-2xl">
              Transparent journey from raw materials to final assembly — verified for trust.
            </p>
            <a
              href="#certificates"
              className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              View all certificates
            </a>
          </div>

          {/* Actions */}
          <div className="flex md:flex-col gap-2 md:justify-start justify-center">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Share Digital Product Passport"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Print Digital Product Passport"
            >
              <Printer className="h-4 w-4" />
              <span className="text-sm">Print</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}