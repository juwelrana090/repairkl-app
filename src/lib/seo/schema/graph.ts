import type { JsonLdObject } from "./types";

/**
 * Merge nodes into a single @graph document. Nodes sharing an @id are merged
 * (the first definition wins on conflicts, later ones only fill missing keys),
 * so a page can include e.g. localBusinessSchema() unconditionally without
 * duplicating the business entity. Nulls are dropped — callers can pass
 * conditionally-built nodes straight through. Per-node "@context" is stripped;
 * the document carries a single top-level one.
 */
export function buildJsonLd(
  nodes: (JsonLdObject | null | undefined)[],
): JsonLdObject {
  const graph: JsonLdObject[] = [];
  const indexOfId = new Map<string, number>();

  for (const node of nodes) {
    if (!node) continue;
    const { "@context": _context, ...rest } = node;
    const id = typeof rest["@id"] === "string" ? rest["@id"] : undefined;
    if (id) {
      const existing = indexOfId.get(id);
      if (existing !== undefined) {
        graph[existing] = { ...rest, ...graph[existing] };
        continue;
      }
      indexOfId.set(id, graph.length);
    }
    graph.push(rest as JsonLdObject);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
