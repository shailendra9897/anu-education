import SCEGenerator from './SCEGeneratorClient';

export const metadata = {
  title: "SCE Report Generator | School Comprehensive Evaluation Report | ANU Education",
  description:
    "Free SCE (School Comprehensive Evaluation) report generator by ANU Education. Generate marks sheet with grade distribution, caste-wise totals, and printable school evaluation report.",
  alternates: {
    canonical: "https://www.anuedu.in/tools/sce-report-generator",
  },
};

export default function Page() {
  return <SCEGenerator />;
}
