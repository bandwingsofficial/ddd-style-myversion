export default function OutletTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {[
              'Outlet',
              'Location',
              'Status',
              'Operation',
              'Live Camera',
              'Actions',
            ].map((column) => (
              <th
                key={column}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground ${
                  column === 'Actions' ? 'text-right' : ''
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-6 w-20 rounded-full bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="h-6 w-28 rounded-full bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="mx-auto h-8 w-8 rounded-lg bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="ml-auto flex justify-end gap-1">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
