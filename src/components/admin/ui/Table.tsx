import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

/** Reference Table: full-width, borderless rows with light dividers and a gray uppercase header. */
export function AdminTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="admin-scrollbar w-full overflow-x-auto">
      <table className={`min-w-full border-collapse text-left ${className}`}>{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-[#e4e7f0] bg-[#f9fafb]">{children}</thead>;
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#f0f2f7]">{children}</tbody>;
}

export function AdminTableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`transition-colors hover:bg-[#fcfcfd] ${className}`}>{children}</tr>;
}

export function AdminTh({ children, className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#8a92a8] ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function AdminTd({ children, className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-4 text-sm text-[#3d4766] ${className}`} {...rest}>
      {children}
    </td>
  );
}
