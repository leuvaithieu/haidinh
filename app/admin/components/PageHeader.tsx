type PageHeaderProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}