// FILE: components/testimonials/IELTSStudentStories.tsx
//
// Renders approved IELTS student testimonials. Server component: no client
// JavaScript is shipped for this section.
//
// When the approved list is empty (the current state), the component returns
// null and the page renders no heading, no card and no placeholder. That is
// deliberate: an empty trust section is better than an unverified one.

import {
  IELTS_APPROVED_TESTIMONIALS,
  isPublishableIeltsTestimonial,
  type ApprovedIeltsTestimonial,
} from "@/lib/data/testimonials/ielts-approved";

type IELTSStudentStoriesProps = {
  testimonials?: readonly ApprovedIeltsTestimonial[];
  heading?: string;
  intro?: string;
};

export default function IELTSStudentStories({
  testimonials = IELTS_APPROVED_TESTIMONIALS,
  heading = "Student Experiences",
  intro,
}: IELTSStudentStoriesProps) {
  const publishable = testimonials.filter(isPublishableIeltsTestimonial);

  if (publishable.length === 0) return null;

  return (
    <section aria-labelledby="ielts-student-stories-heading">
      <h2
        id="ielts-student-stories-heading"
        className="text-center text-3xl font-bold text-gray-900"
      >
        {heading}
      </h2>
      {intro ? (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600">
          {intro}
        </p>
      ) : null}
      <ul className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
        {publishable.map((testimonial) => (
          <li key={testimonial.id} className="h-full">
            <figure className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-gray-100 pt-3">
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-xs text-gray-500">
                  {[testimonial.course, testimonial.city]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {testimonial.bandScore ? (
                  <p className="mt-1 text-xs font-semibold text-green-700">
                    Reported score: {testimonial.bandScore}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
