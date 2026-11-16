import IELTSGandhinagarClient from "./IELTSGandhinagarClient";
import JsonLd from "@/components/JsonLd";
import { buildIeltsSchemaForPage } from "@/lib/seo/ielts-page-config";

const PAGE_NAME =
  "IELTS Coaching in Gandhinagar – Online Classes & Mock Tests | ANU Education";
const PAGE_DESCRIPTION =
  "Online IELTS coaching for Gandhinagar students with live classes, full-length mock tests, speaking practice and study abroad support. 5-day free demo available.";
const CANONICAL = "https://www.anuedu.in/test-prep/ielts-coaching-gandhinagar";

export const metadata = {
  metadataBase: new URL("https://www.anuedu.in"),
  title: PAGE_NAME,
  description: PAGE_DESCRIPTION,
  keywords: [
    "IELTS coaching Gandhinagar",
    "IELTS classes Gandhinagar",
    "IELTS preparation Gandhinagar",
    "online IELTS coaching Gandhinagar",
    "study abroad Gandhinagar",
  ],
  openGraph: {
    title: "IELTS Coaching in Gandhinagar – Online Classes & Mock Tests",
    description:
      "Live online IELTS training with mock tests, speaking practice and study abroad support. 5-day free demo available. Prices include GST.",
    url: CANONICAL,
    siteName: "ANU Education",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Coaching in Gandhinagar – Online Classes & Mock Tests",
    description:
      "Live online IELTS training, mock tests and speaking practice. 5-day free demo available.",
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function Page() {
  const graph = buildIeltsSchemaForPage(
    "gandhinagar",
    PAGE_NAME,
    PAGE_DESCRIPTION,
  );

  return (
    <>
      <JsonLd data={graph} />
      <IELTSGandhinagarClient />
    </>
  );
}
