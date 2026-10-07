import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/**
 * Link that routes by href kind: root-relative and hash hrefs use next/link
 * (client-side navigation, prefetching); absolute http(s) hrefs render as
 * `<a target="_blank" rel="noopener noreferrer">`; mailto:/tel: render as
 * plain anchors (no new tab).
 */
export default function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const newTab = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
