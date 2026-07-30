export default function ProductsTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {[
                'Product',
                'Category',
                'Status',
                'Trending',
                'Price',
                'Actions',
              ].map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="ml-auto h-4 w-14 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="ml-auto flex justify-end gap-1">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
