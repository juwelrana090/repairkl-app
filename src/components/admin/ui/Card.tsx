import type { ReactNode } from "react";

/** Reference ComponentCard: rounded-2xl white card with a header title/description and a divided body. */
export function AdminCard({
  title,
  desc,
  actions,
  children,
  className = "",
}: {
  title?: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#e4e7f0] bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            {title && <h3 className="text-base font-semibold text-[#001353]">{title}</h3>}
            {desc && <p className="mt-1 text-sm text-[#5b6480]">{desc}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={title || actions ? "border-t border-[#f0f2f7] p-4 sm:p-6" : "p-4 sm:p-6"}>
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
}
