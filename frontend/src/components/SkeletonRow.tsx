export default function SkeletonRow({ columns, rows = 5 }: { columns: number, rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="animate-pulse bg-white dark:bg-[#0a0a0a]">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`skeleton-col-${colIndex}`} className="px-6 py-4 whitespace-nowrap border-b border-black/5 dark:border-white/5">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
