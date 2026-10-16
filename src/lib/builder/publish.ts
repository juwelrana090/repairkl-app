// Server-side draft validation + revision policy (page-builder §4.7, VB8).
//
// Imported only by API routes: SECTION_REGISTRY pulls in the section
// components, which must stay out of client bundles. Both the publish and
// the restore endpoints validate EVERY section's props with the registry
// zod schema before anything is written — the client's local validation is
// a UX nicety, this is the gate.

import type { Prisma } from "@prisma/client";
import { normalizeAssetPathsDeep } from "@/lib/assetPath";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { normalizeDraftLayout } from "./draft";

/** How many publish snapshots to keep per page (§4.7: "keep last 20"). */
export const KEEP_REVISIONS = 20;

export type ValidatedSection = {
  type: keyof typeof SECTION_REGISTRY;
  props: Prisma.InputJsonValue;
  isVisible: boolean;
  label: string | null;
  isLocked: boolean;
};

export type DraftValidation =
  | { ok: true; sections: ValidatedSection[] }
  | {
      ok: false;
      status: number;
      body: { error: string; index?: number; issues?: { path: (string | number)[]; message: string }[] };
    };

/**
 * Validates a raw layout (client payload, stored draftLayout or revision
 * snapshot) against the registry. Mirrors the save endpoint's error
 * contract: unknown type → 400 with the 0-based index, invalid props → 422
 * with the index and zod issues, unusable shape → 400.
 */
export function validateDraftSections(raw: unknown): DraftValidation {
  const draft = normalizeDraftLayout(raw);
  if (draft === null) {
    return { ok: false, status: 400, body: { error: "Invalid sections payload" } };
  }

  const sections: ValidatedSection[] = [];
  for (const [index, section] of draft.entries()) {
    if (!Object.hasOwn(SECTION_REGISTRY, section.type)) {
      return {
        ok: false,
        status: 400,
        body: { error: `Unknown section type at position ${index + 1}`, index },
      };
    }
    const type = section.type as keyof typeof SECTION_REGISTRY;
    const parsed = SECTION_REGISTRY[type].schema.safeParse(section.props ?? {});
    if (!parsed.success) {
      return {
        ok: false,
        status: 422,
        body: {
          error: `Invalid props for ${type} at position ${index + 1}`,
          index,
          issues: parsed.error.issues.map((issue) => ({
            // zod v4 paths are PropertyKey[] — symbols can't reach JSON.
            path: issue.path.map((key) => String(key)),
            message: issue.message,
          })),
        },
      };
    }
    sections.push({
      type,
      // Legacy `/assets/images/...` values heal to `/images/...` on the way in (P4).
      props: normalizeAssetPathsDeep(parsed.data) as Prisma.InputJsonValue,
      isVisible: section.isVisible,
      label: section.label,
      isLocked: section.isLocked,
    });
  }
  return { ok: true, sections };
}
