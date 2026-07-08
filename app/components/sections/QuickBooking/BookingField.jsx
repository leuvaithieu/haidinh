export default function BookingField({
  icon,
  label,
  placeholder,
  children,
}) {
  return (
    <div className="group flex h-14 items-center gap-3 rounded-xl border border-gray-200 bg-white mx-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 lg:h-[72px] lg:gap-4 lg:rounded-2xl lg:px-5">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary lg:h-10 lg:w-10">
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-500 lg:text-xs">
          {label}
        </p>

        {children ? (
          children
        ) : (
          <input
            type="text"
            placeholder={placeholder}
            className="mt-1 w-full border-none bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
          />
        )}
      </div>
    </div>
  );
}