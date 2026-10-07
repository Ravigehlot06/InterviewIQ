export default function Input({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-2xl border-0 bg-panel px-4 py-2.5 text-ink placeholder:text-ink-faint outline-none ring-1 ring-line focus:ring-2 focus:ring-emerald/40 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
