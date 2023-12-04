export function DevHelper({ data }) {
  return (
    <details>
      <summary>JSON Output</summary>
      <pre className="rounded-md bg-black p-8 text-xs text-slate-50">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}
