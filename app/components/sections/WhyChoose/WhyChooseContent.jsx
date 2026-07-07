import { Check } from "lucide-react";

import { features } from "./data";

export default function WhyChooseContent() {
  return (
    <div>
      <span className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">
        WHY CHOOSE US
      </span>

      <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-900 lg:text-5xl">
        Hành trình an tâm
      </h2>

      <p className="mt-5 leading-8 text-gray-600">
        Đây sẽ là phần giới thiệu sau.
      </p>

      <div className="mt-10 space-y-5">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>

            <span className="font-medium text-gray-800">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        className="
        mt-10
        inline-flex
        h-12
        items-center
        justify-center
        rounded-full
        bg-primary
        px-7
        text-sm
        font-semibold
        text-white
        transition-all
        duration-300
        hover:bg-primary/90
        "
      >
        Đặt vé ngay
      </button>
    </div>
  );
}