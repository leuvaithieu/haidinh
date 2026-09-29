'use client'

type ToastProps = {
    message :string,
    type:'success' | 'error',
    onClose : ()=>void ,
}

export default function Toast({
    message,type,onClose
}:ToastProps){
    return (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
        <div
            className={
            type === 'success'
                ? 'rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-lg'
                : 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg'
            }
        >
            <div className="flex items-start justify-between gap-4">
            <p
                className={
                type === 'success'
                    ? 'text-sm font-medium text-green-700'
                    : 'text-sm font-medium text-red-700'
                }
            >
                {message}
            </p>

            <button
                type="button"
                onClick={onClose}
                className="text-sm text-slate-400 hover:text-slate-700"
            >
                ×
            </button>
            </div>
        </div>
        </div>
    );
}