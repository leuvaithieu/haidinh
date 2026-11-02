import Container from "@/app/components/layout/Containers";

import WhyChooseContent from "./WhyChooseContent";
import WhyChooseSlider from "./WhyChooseSlider";

export default function WhyChoose() {
  return (
    <section
      id="why-choose"
      className="overflow-hidden bg-gray-50 py-10 sm:py-14 lg:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-7 sm:gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Hình ảnh trên mobile, bên phải trên desktop */}
          <div className="order-1 flex min-w-0 justify-center lg:order-2">
            <div className="w-full max-w-xl">
              <WhyChooseSlider />
            </div>
          </div>

          {/* Nội dung giới thiệu */}
          <div className="order-2 min-w-0 lg:order-1">
            <WhyChooseContent />
          </div>
        </div>
      </Container>
    </section>
  );
}