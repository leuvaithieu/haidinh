import Container from "@/app/components/layout/Containers";

import WhyChooseContent from "./WhyChooseContent";
import WhyChooseSlider from "./WhyChooseSlider";

export default function WhyChoose() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
                <WhyChooseContent />
            </div>

            <div className="order-1 flex justify-center lg:order-2">
                <WhyChooseSlider />
            </div>
        </div>
      </Container>
    </section>
  );
}