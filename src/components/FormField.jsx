export default function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  textarea = false,
  rows = 3,
}) {
  const baseClass =
    'w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brass-400 focus:ring-1 focus:ring-brass-300 transition-colors';

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-ink-700 mb-1.5">
        {Icon && <Icon size={14} className="text-ink-400" />}
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}
