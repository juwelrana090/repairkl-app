import Link from "next/link";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** Breadcrumb trail, e.g. [{ label: "Blog", href: "/admin/posts" }, { label: "New post" }]. */
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

/** Reference PageBreadcrumb + page title row: title left, breadcrumb under it, actions right. */
export default function AdminPageHeader({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#001353]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#5b6480]">{description}</p>}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mt-2" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#98a2b3" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 12l4-4-4-4" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-[#5b6480] hover:text-[#034795]">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#001353]">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
