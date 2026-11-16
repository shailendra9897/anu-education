"use client";

// FILE: components/courses/IELTSPricingCards.tsx
//
// Reusable, purely presentational pricing-card grid for IELTS packages.
//
// Contract:
//   - Every commercial value (selling price, reference price, savings,
//     validity, per-day amount, badge, features, CTA) arrives via typed
//     props. No price literal or pricing registry lives in this file.
//   - The parent must supply an approved CTA destination or callback.
//     This component never builds a registration, payment or WhatsApp URL
//     and contains no checkout logic.
//   - Tax presentation is opt-in through `gstLabel`. Nothing is rendered
//     when the parent does not supply it, so the component never assumes
//     whether a price includes or excludes tax.

import React, { useId } from "react";
import { CalendarDays, Check } from "lucide-react";
import type {
  IELTSPricingCta,
  IELTSPricingPackage,
} from "@/lib/data/ielts-package-types";

// Keep the component's public type exports stable for existing callers.
export type {
  IELTSPricingCta,
  IELTSPricingPackage,
} from "@/lib/data/ielts-package-types";

export type IELTSPricingCardsProps = {
  packages: readonly IELTSPricingPackage[];
  heading?: string;
  intro?: string;
  footnote?: string;
  className?: string;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function safeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function PricingCta({
  cta,
  packageId,
  recommended,
  variant = "primary",
}: {
  cta: IELTSPricingCta;
  packageId: string;
  recommended: boolean;
  variant?: "primary" | "secondary";
}) {
  const helperId = `cta-help-${useId().replace(/:/g, "")}`;
  const disabled = "disabled" in cta;
  const secondary = variant === "secondary";

  const baseClassName = [
    "inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  ];

  const activeTone = recommended
    ? secondary
      ? "border border-white/50 bg-transparent text-white hover:bg-white/10 focus-visible:outline-white"
      : "bg-white text-blue-900 hover:bg-blue-50 focus-visible:outline-white"
    : secondary
      ? "border border-blue-200 bg-white text-blue-800 hover:bg-blue-50 focus-visible:outline-blue-700"
      : "bg-blue-700 text-white hover:bg-blue-800 focus-visible:outline-blue-700";

  const disabledTone = recommended
    ? "cursor-not-allowed border border-blue-700 bg-blue-950/40 text-blue-300 focus-visible:outline-blue-200"
    : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400 focus-visible:outline-gray-400";

  const className = [...baseClassName, disabled ? disabledTone : activeTone].join(" ");

  if ("disabled" in cta) {
    return (
      <div>
        <button
          type="button"
          aria-disabled="true"
          aria-label={cta.ariaLabel}
          aria-describedby={cta.helperText ? helperId : undefined}
          className={className}
        >
          {cta.label}
        </button>
        {cta.helperText ? (
          <p
            id={helperId}
            className={[
              "mt-2 text-center text-xs",
              recommended ? "text-blue-200" : "text-gray-500",
            ].join(" ")}
          >
            {cta.helperText}
          </p>
        ) : null}
      </div>
    );
  }

  if ("href" in cta) {
    if (cta.appearance === "bookNow") {
      return (
        <div>
          <a
            href={cta.href}
            aria-label={cta.ariaLabel}
            style={{
              width: "150px",
              backgroundColor: "#1065b7",
              textAlign: "center",
              fontWeight: 800,
              padding: "11px 0px",
              color: "white",
              fontSize: "12px",
              display: "inline-block",
              textDecoration: "none",
              borderRadius: "3.229px",
            }}
          >
            {cta.label}
          </a>
        </div>
      );
    }

    const external = cta.external ?? /^https?:\/\//i.test(cta.href);
    return (
      <a
        href={cta.href}
        aria-label={cta.ariaLabel}
        className={className}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {cta.label}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={cta.ariaLabel}
      className={className}
      onClick={() => cta.onSelect(packageId)}
    >
      {cta.label}
    </button>
  );
}

export default function IELTSPricingCards({
  packages,
  heading,
  intro,
  footnote,
  className,
}: IELTSPricingCardsProps) {
  const uid = useId().replace(/:/g, "");
  const headingId = `${uid}-heading`;
  const hasHeading = Boolean(heading);
  const hasHeader = Boolean(heading || intro);

  if (packages.length === 0) return null;

  return (
    <section
      className={["w-full", className].filter(Boolean).join(" ")}
      {...(hasHeading
        ? { "aria-labelledby": headingId }
        : { "aria-label": "IELTS pricing packages" })}
    >
      {hasHeader ? (
        <header className="mx-auto max-w-2xl text-center">
          {heading ? (
            <h2
              id={headingId}
              className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl"
            >
              {heading}
            </h2>
          ) : null}
          {intro ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
              {intro}
            </p>
          ) : null}
        </header>
      ) : null}

      <ul
        className={[
          "grid gap-5 md:grid-cols-3 md:items-stretch",
          hasHeader ? "mt-8" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {packages.map((pkg) => {
          const recommended = pkg.recommended === true;
          const titleId = `${uid}-${safeIdPart(pkg.packageId)}-title`;

          return (
            <li key={pkg.packageId} className="h-full">
              <article
                data-package-id={pkg.packageId}
                data-recommended={recommended ? "true" : "false"}
                aria-labelledby={titleId}
                className={[
                  "flex h-full flex-col overflow-hidden rounded-3xl border",
                  recommended
                    ? "border-blue-900 bg-blue-900 text-white shadow-2xl ring-4 ring-blue-200/70"
                    : "border-blue-100 bg-white text-gray-900 shadow-sm",
                ].join(" ")}
              >
                {pkg.badge ? (
                  <p
                    className={[
                      "px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em]",
                      recommended
                        ? "bg-amber-300 text-blue-950"
                        : "bg-blue-100 text-blue-900",
                    ].join(" ")}
                  >
                    {pkg.badge}
                  </p>
                ) : null}

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <header>
                    <h3
                      id={titleId}
                      className="text-xl font-bold leading-snug sm:text-2xl"
                    >
                      {pkg.title}
                    </h3>
                    <p
                      className={[
                        "mt-1 text-sm",
                        recommended ? "text-blue-100" : "text-gray-600",
                      ].join(" ")}
                    >
                      {pkg.subtitle}
                    </p>
                  </header>

                  <div className="mt-5">
                    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                      <p
                        className={[
                          "text-4xl font-extrabold tracking-tight",
                          recommended ? "text-white" : "text-blue-800",
                        ].join(" ")}
                      >
                        <span className="sr-only">Selling price: </span>
                        {formatInr(pkg.sellingPrice)}
                      </p>
                      {typeof pkg.referencePrice === "number" ? (
                        <p
                          className={[
                            "pb-1 text-sm",
                            recommended ? "text-blue-200" : "text-gray-500",
                          ].join(" ")}
                        >
                          <span className="sr-only">Reference price: </span>
                          <del className="line-through">
                            {formatInr(pkg.referencePrice)}
                          </del>
                        </p>
                      ) : null}
                    </div>

                    {pkg.gstLabel ? (
                      <p
                        className={[
                          "mt-2 text-xs font-medium",
                          recommended ? "text-blue-100" : "text-gray-600",
                        ].join(" ")}
                      >
                        {pkg.gstLabel}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {typeof pkg.savingsAmount === "number" ? (
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            recommended
                              ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                          ].join(" ")}
                        >
                          Save {formatInr(pkg.savingsAmount)}
                        </span>
                      ) : null}
                      {typeof pkg.perDayAmount === "number" ? (
                        <span
                          className={[
                            "text-xs font-medium",
                            recommended ? "text-blue-100" : "text-gray-600",
                          ].join(" ")}
                        >
                          Approximately {formatInr(pkg.perDayAmount)}/day
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={[
                        "mt-3 flex items-center gap-1.5 text-xs font-semibold",
                        recommended ? "text-blue-100" : "text-gray-600",
                      ].join(" ")}
                    >
                      <CalendarDays
                        className="h-4 w-4 flex-none"
                        aria-hidden="true"
                      />
                      {pkg.validity} validity
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm leading-relaxed">
                    {pkg.features.map((feature, index) => (
                      <li
                        key={`${pkg.packageId}-feature-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        <Check
                          className={[
                            "mt-0.5 h-4 w-4 flex-none",
                            recommended
                              ? "text-emerald-300"
                              : "text-emerald-600",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span
                          className={
                            recommended ? "text-blue-50" : "text-gray-700"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-3 pt-7">
                    <PricingCta
                      cta={pkg.cta}
                      packageId={pkg.packageId}
                      recommended={recommended}
                    />
                    {pkg.secondaryCta ? (
                      <PricingCta
                        cta={pkg.secondaryCta}
                        packageId={pkg.packageId}
                        recommended={recommended}
                        variant="secondary"
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {footnote ? (
        <p
          className={[
            "text-center text-xs leading-relaxed text-gray-500",
            hasHeader ? "mt-6" : "mt-5",
          ].join(" ")}
        >
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
