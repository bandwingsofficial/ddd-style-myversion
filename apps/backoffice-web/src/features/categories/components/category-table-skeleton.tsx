export default function CategoryTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {['Drag', 'Image', 'Category', 'Subtitle', 'Status', 'Actions'].map(
                (column) => (
                  <th
                    key={column}
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                </td>
                <td className="px-6 py-4">
                  <div className="ml-auto h-8 w-28 animate-pulse rounded-lg bg-muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
