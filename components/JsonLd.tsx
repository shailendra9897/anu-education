/* eslint-disable react/no-danger */

// FILE: components/JsonLd.tsx
//
// Server-rendered JSON-LD helper.
//
// Serialisation is hardened against HTML-context injection: `<`, `>`, `&`
// and the two JavaScript line separators are escaped to their `\uXXXX`
// form inside the JSON string. The result is still valid JSON, but a
// `</script>` sequence inside a value can no longer terminate the tag
// early. Callers pass plain objects; this component never derives or
// invents structured data.

type JsonLdValue = Record<string, unknown> | readonly Record<string, unknown>[];

function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export { serializeJsonLd };
