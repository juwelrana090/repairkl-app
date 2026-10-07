import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current (last) crumb — it renders as aria-current text. */
  href?: string;
}

/**
 * Visible breadcrumb trail for the dark marketing heroes. Keep the labels
 * in sync with the BreadcrumbList JSON-LD each page emits via
 * breadcrumbSchema() — both should describe the same trail.
 */
export default function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  /** Landing on the <nav> — pass e.g. "flex justify-center mb-4" inside
   *  centered heroes, or "mb-6" for left-aligned ones. */
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-white/60">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1 && !item.href;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-white/30">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? "font-semibold text-white" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
