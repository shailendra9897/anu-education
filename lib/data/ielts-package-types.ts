// FILE: lib/data/ielts-package-types.ts
//
// Neutral shared types for IELTS marketing packages.
//
// These types live in the data layer so `lib/data/ielts-packages.ts` can
// describe package data without importing a React component. The visible
// card component re-exports them for backwards compatibility, so callers
// still get the same public type names from
// `components/courses/IELTSPricingCards`.
//
// Scope guard: no price, CTA destination, GST label or checkout field is
// defined here. They are contracts only.

export type IELTSPricingCta =
  | {
      label: string;
      /** Approved in-app or external destination. */
      href: string;
      /** Defaults to true for absolute http(s) URLs. */
      external?: boolean;
      ariaLabel?: string;
      /**
       * Optional presentational variant. `"bookNow"` renders the compact
       * inline Book Now block used by the Self Prep PayU link.
       */
      appearance?: "default" | "bookNow";
    }
  | {
      label: string;
      /** Approved parent handler. No payment/checkout logic belongs here. */
      onSelect: (packageId: string) => void;
      ariaLabel?: string;
    }
  | {
      label: string;
      /**
       * Explicit unavailable state. Renders a focusable button with
       * aria-disabled="true" and no action, so nothing implies that a
       * purchase is currently possible.
       */
      disabled: true;
      /** Optional visible and accessible explanation. */
      helperText?: string;
      ariaLabel?: string;
    };

export type IELTSPricingPackage = {
  /** Stable identifier used for keys, test hooks and CTA callbacks. */
  packageId: string;
  title: string;
  subtitle: string;
  /** Amount supplied by the parent, in whole rupees. */
  sellingPrice: number;
  /** Optional pre-discount reference amount supplied by the parent. */
  referencePrice?: number;
  /** Optional saving supplied by the parent, in whole rupees. */
  savingsAmount?: number;
  /** Display phrase, e.g. "6 months". */
  validity: string;
  /** Optional per-day display amount supplied by the parent. */
  perDayAmount?: number;
  badge?: string;
  /** Gives this card the strongest visual emphasis. */
  recommended?: boolean;
  features: readonly string[];
  /** Primary page-owned action. */
  cta: IELTSPricingCta;
  /** Optional secondary page-owned action, e.g. Book Free Demo. */
  secondaryCta?: IELTSPricingCta;
  /** Optional tax label for a future approved integration. */
  gstLabel?: string;
};

/**
 * Package data without parent-supplied CTAs or any tax presentation.
 * The catalogue module owns commercial data; the page owns the actions.
 */
export type IELTSPackageData = Omit<
  IELTSPricingPackage,
  "cta" | "secondaryCta" | "gstLabel"
>;
