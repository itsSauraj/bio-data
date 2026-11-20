export default function SampleNotice() {
  return (
    <div className="border-b border-saffron/40 bg-saffron/15 px-4 py-2 text-center text-xs text-ink sm:text-sm print:hidden">
      <strong className="font-bold">Sample content.</strong> Edit{" "}
      <code className="rounded bg-paper px-1 py-0.5 font-mono text-[0.85em]">src/data/biodata.ts</code> with real
      details and set <code className="rounded bg-paper px-1 py-0.5 font-mono text-[0.85em]">sampleData: false</code>{" "}
      to hide this notice.
    </div>
  );
}
