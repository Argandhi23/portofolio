interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Safely renders Schema.org JSON-LD structured data for search engines.
 * Escapes `<` characters to prevent script tag breakout.
 */
export function JsonLd({ data }: JsonLdProps) {
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
