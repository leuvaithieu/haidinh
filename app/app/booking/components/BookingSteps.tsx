
'use client';

type BookingStepsProps = {
    currentStep: 1 | 2 | 3;
};

// Hiển thị tiến trình ba bước trong quy trình đặt vé.
export default function BookingSteps({
    currentStep,
}: BookingStepsProps) {
    const steps = [
        { id: 1, label: 'Chọn chuyến' },
        { id: 2, label: 'Chọn ghế & nhập thông tin' },
        { id: 3, label: 'Xác nhận đặt vé' },
    ] as const;

    return (
        <div className="w-full">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex min-w-0 flex-1 items-center"
                        >
                            <div className="flex min-w-0 flex-col items-center">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                                        isCompleted
                                            ? 'border-red-600 bg-red-600 text-white'
                                            : isCurrent
                                              ? 'border-red-600 bg-white text-red-600'
                                              : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                                >
                                    {isCompleted ? '✓' : step.id}
                                </div>

                                <span
                                    className={`mt-2 max-w-28 text-center text-[11px] font-medium sm:max-w-none sm:text-xs ${
                                        isCurrent
                                            ? 'text-red-600'
                                            : isCompleted
                                              ? 'text-gray-800'
                                              : 'text-gray-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-2 mb-5 h-0.5 flex-1 sm:mx-4 ${
                                        step.id < currentStep
                                            ? 'bg-red-600'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
