/**
 * Segment loading UI for the auth-walled panels (admin/worker/support/
 * customer). Shown by each group's loading.tsx while the layout + page do
 * their server work (session check, DB queries).
 */
export default function PanelLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-full border-[3px] border-[#ddddee] border-t-[#034795] animate-spin" />
          <span className="text-sm font-semibold text-[#5b6480]">Loading…</span>
        </div>
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] border border-[#ddddee] p-5 animate-pulse"
            >
              <div className="h-3 w-20 bg-[#eeeef6] rounded mb-3" />
              <div className="h-7 w-14 bg-[#eeeef6] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
