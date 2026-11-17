import { Check } from "lucide-react";
import { features } from "./data";

export default function WhyChooseContent() {
  return (
    <div className="w-full max-w-xl">
      {/* Badge */}
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary sm:tracking-[0.25em]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Từ năm 2000
      </span>

      {/* Heading */}
      <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] tracking-tight text-gray-900 sm:mt-4 sm:text-4xl lg:text-5xl">
        Hơn 25 năm
        <br />
        đồng hành trên
        <br className="hidden sm:block" />
        <span className="text-primary sm:ml-2">
          mọi hành trình
        </span>
      </h2>

      {/* Description */}
      <p className="mt-4 text-sm leading-6 text-gray-600 sm:mt-6 sm:text-base sm:leading-8">
        Với hơn 25 năm kinh nghiệm trong lĩnh vực vận tải hành khách,
        Hải Định không ngừng nâng cao chất lượng dịch vụ, đầu tư đội xe
        hiện đại và xây dựng đội ngũ tài xế chuyên nghiệp. Mỗi chuyến đi
        đều được thực hiện với sự an toàn, đúng giờ và tận tâm.
      </p>

      {/* Features */}
      <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4 lg:mt-10 lg:space-y-5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex min-w-0 items-start gap-3 sm:gap-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
              <Check className="h-5 w-5 text-primary" />
            </span>

            <span className="min-w-0 pt-1 text-sm font-medium leading-6 text-gray-800 sm:text-base sm:leading-7">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}