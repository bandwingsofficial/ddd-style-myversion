export function traceOutletLifecycle(
  stage: string,
  ids: Record<string, string | null | undefined>,
): void {
  console.info('[outlet-trace]', {
    stage,
    ...ids,
    at: new Date().toISOString(),
  });
}
