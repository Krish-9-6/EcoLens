"use client"

import { Card, CardContent, CardHeader, CardTitle } from "<ecolens>/components/ui/card";
import type { SupplierWithCertificates } from "<ecolens>/lib/types";
import { JourneyStep } from "./JourneyStep";

interface JourneyTimelineProps {
  suppliers: SupplierWithCertificates[];
}

export function JourneyTimeline({ suppliers }: JourneyTimelineProps) {
  // Sort suppliers by tier (Tier 3 → Tier 2 → Tier 1)
  const sortedSuppliers = [...suppliers].sort((a, b) => b.tier - a.tier);

  const handleViewCertificates = (supplierId: string) => {
    const el = document.getElementById("certificates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Future: emit filter event for supplierId
    }
  };

  if (sortedSuppliers.length === 0) {
    return (
      <section className="w-full" aria-labelledby="journey-heading">
        <Card>
          <CardHeader>
            <CardTitle id="journey-heading" className="text-xl font-semibold">
              Supply Chain Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground" role="status" aria-live="polite">
              No supply chain information available.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full" aria-labelledby="journey-heading">
      <Card>
        <CardHeader>
          <CardTitle id="journey-heading" className="text-xl font-semibold">
            Supply Chain Journey
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Follow the path from raw materials to final product
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <ol className="relative" role="list" aria-label="Supply chain timeline">
            {sortedSuppliers.map((supplier, index) => (
              <JourneyStep
                key={supplier.id}
                index={index}
                total={sortedSuppliers.length}
                supplier={supplier}
                onViewCertificates={handleViewCertificates}
              />
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}