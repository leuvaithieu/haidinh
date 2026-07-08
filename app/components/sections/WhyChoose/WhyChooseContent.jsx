import { Check } from "lucide-react";

import { features } from "./data";

export default function WhyChooseContent() {
  return (
    <div className="max-w-xl">
      {/* Badge */}
      <span className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">
        TỪ NĂM 2000
      </span>

      {/* Heading */}
      <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-900 lg:text-5xl">
        Hơn 25 năm
        <br />
        đồng hành trên
        <br />
        mọi hành trình
      </h2>

      {/* Description */}
      <p className="mt-6 text-base leading-8 text-gray-600">
        Với hơn 25 năm kinh nghiệm trong lĩnh vực vận tải hành khách,
        Hải Định không ngừng nâng cao chất lượng dịch vụ, đầu tư đội xe
        hiện đại và xây dựng đội ngũ tài xế chuyên nghiệp. Mỗi chuyến đi
        đều được thực hiện với sự an toàn, đúng giờ và tận tâm.
      </p>

      {/* Features */}
      <div className="mt-10 space-y-5">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-4"
          >
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Check className="text-primary h-5 w-5" />
            </div>

            <span className="text-base font-medium text-gray-800">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}