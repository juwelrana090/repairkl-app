import Link from "next/link";

// Plain links (no client JS) so every page is crawlable via ?page=n.
export default function Pagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  const linkClass =
    "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl text-sm font-bold border border-[#ddddee] text-[#001353] hover:border-[#034795] hover:text-[#034795] transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : null}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span
            key={n}
            aria-current="page"
            className="inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl text-sm font-bold bg-[#034795] text-white"
          >
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={linkClass}>
            {n}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
