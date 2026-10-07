/**
 * Renders a schema.org JSON-LD document (a single node, or the @graph from
 * buildJsonLd()) as a <script type="application/ld+json"> tag.
 *
 * Every "<" is escaped to the six-character JSON escape backslash-u-003c so a
 * literal closing-script sequence inside review text or a description can't
 * break out of the tag — JSON.stringify alone doesn't escape forward slashes.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
