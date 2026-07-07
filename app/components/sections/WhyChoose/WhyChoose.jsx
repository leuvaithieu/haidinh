import Container from "@/app/components/layout/Containers";

import WhyChooseContent from "./WhyChooseContent";
import WhyChooseSlider from "./WhyChooseSlider";

export default function WhyChoose() {
  return (
    <section className="bg-gray-50 py-16 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[480px_1fr] lg:gap-20">
          {/* Mobile: Slider trước */}
          <div className="order-1 lg:order-2">
            <WhyChooseSlider />
          </div>

          {/* Desktop: Content bên trái */}
          <div className="order-2 lg:order-1">
            <WhyChooseContent />
          </div>
        </div>
      </Container>
    </section>
  );
}