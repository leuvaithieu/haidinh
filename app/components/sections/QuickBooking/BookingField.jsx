export default function BookingField({
  icon,
  label,
  placeholder,
  children,
}) {
  return (
    <div className="flex min-h-[72px] min-w-0 flex-col justify-center rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 transition-colors duration-200 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/10 sm:px-4">
      <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-gray-500 sm:text-sm">
        {icon && (
          <span className="shrink-0 text-red-600">
            {icon}
          </span>
        )}

        <span className="truncate">{label}</span>
      </label>

      {children ? (
        <div className="mt-1 min-w-0">
          {children}
        </div>
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          aria-label={label}
          className="mt-1 min-h-6 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-semibold text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
      )}
    </div>
  );
}