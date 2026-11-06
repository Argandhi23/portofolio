export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg bg-[#181818]" />
          <div className="h-3.5 w-64 rounded-lg bg-[#141414]" />
        </div>
        <div className="h-9 w-32 rounded-full bg-[#181818]" />
      </div>

      {/* Cards Row Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 rounded-2xl border border-white/[0.06] bg-[#121212] p-4"
          >
            <div className="h-3 w-20 rounded bg-[#181818]" />
            <div className="mt-4 h-7 w-14 rounded bg-[#181818]" />
          </div>
        ))}
      </div>

      {/* Main Content Block Skeleton */}
      <div className="h-72 rounded-2xl border border-white/[0.06] bg-[#121212] p-6 space-y-4">
        <div className="h-4 w-48 rounded bg-[#181818]" />
        <div className="space-y-2.5 pt-2">
          <div className="h-10 w-full rounded-xl bg-[#161616]" />
          <div className="h-10 w-full rounded-xl bg-[#161616]" />
          <div className="h-10 w-full rounded-xl bg-[#161616]" />
        </div>
      </div>
    </div>
  );
}
