export default function BookingField({
    icon,
    label,
    placeholder,
    children,
  }) {
    return (
      <div className="group flex h-[72px] items-center gap-4 rounded-2xl border border-gray-200 bg-white px-2 transition-all duration-300 hover:border-primary focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
  
        <div className="flex flex-1 flex-col">
          <span className="text-xs font-medium text-gray-500">0
            {label}
          </span>
  
          {children ?? (
            <input
              placeholder={placeholder}
              className="mt-1 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
          )}
        </div>
      </div>
    );
  }