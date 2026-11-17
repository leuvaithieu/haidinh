type ConfirmModalProps = {
    isOpen :boolean,
    title:string,
    message :string,
    confirmText?:string,
    cancelText?:string,
    onConfirm:()=>void,
    onCancel:()=>void,
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onCancel,
    onConfirm
}:ConfirmModalProps){
    if(!isOpen){
        return null;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
            {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
            {message}
            </p>

            <div className="mt-6 flex justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                {cancelText}
            </button>

            <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
                {confirmText}
            </button>
            </div>
        </div>
        </div>
    );
}