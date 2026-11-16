"use client";

// FILE: components/offers/PteAcademicChampionOfferCard.tsx
//
// Visible pricing card for the PTE Academic Champion promotional offer.
// Renders ONLY from lib/data/offers/pte-academic-champion-flagship.ts —
// no price is typed in this component, and every amount is "₹X + GST".
//
// The PTE Champion catalogue price is NOT shown here and is never
// presented as this offer's previous price. The ₹5,998 "regular" fee is
// this offer's reference fee, not a historical catalogue price.

import {
  PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER,
  formatPteOfferGstPrice,
  getPteChampionOfferHeadline,
} from "@/lib/data/offers/pte-academic-champion-flagship";
import { formatAmount } from "@/lib/data/price-view";
import { getWhatsAppLink, websiteWhatsAppMessages } from "@/lib/whatsappTemplates";

export default function PteAcademicChampionOfferCard() {
  const offer = PTE_ACADEMIC_CHAMPION_FLAGSHIP_OFFER;

  const regularPrice = formatPteOfferGstPrice(offer.regularPrice);
  const promoPrice = formatPteOfferGstPrice(offer.promotionalPrice);

  return (
    <div className="mx-auto max-w-3xl bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 px-4 font-bold tracking-wide">
        {getPteChampionOfferHeadline()}
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            PTE Academic · Promotional Offer
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            {offer.displayName}
          </h3>
          <p className="text-sm text-gray-600">
            Marketing offer on the PTE Academic Champion pack
          </p>
        </div>

        {/* Pricing block */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-lg text-gray-500 line-through">
              {regularPrice}
            </span>
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {offer.offerLabel}
            </span>
          </div>
          <div className="mt-2 text-4xl font-extrabold text-blue-700">
            {promoPrice}
          </div>
          <p className="mt-3 text-sm text-gray-700">
            {offer.promotionalPrice.toLocaleString("en-IN")} is the course fee
            before GST. GST is charged extra — this is not the final amount
            payable.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Regular reference fee {regularPrice} · {offer.currency} · prices
            exclude GST
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <a
            href={getWhatsAppLink(websiteWhatsAppMessages.pte)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-green-700 transition"
          >
            Enquire at {promoPrice}
          </a>
          <a
            href="/free-demo"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
          >
            Book Free Demo Class
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This promotional offer applies only to the PTE Academic Champion pack.
          Live Class, Self Prep and PTE Core Mock Tests are listed above at
          their own catalogue prices. The{" "}
          {formatAmount(offer.regularPrice, offer.currency)}{" "}
          reference fee is this offer&apos;s regular fee before GST — it is not
          a historical catalogue price, and this offer is not chargeable
          through online checkout.
        </p>
      </div>
    </div>
  );
}