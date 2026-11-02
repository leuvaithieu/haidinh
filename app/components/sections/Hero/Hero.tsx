import Image from "next/image";
import Container from "@/app/components/layout/Containers";
import HeroContent from "./HeroContent";

import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[500px] overflow-hidden bg-neutral-950 sm:min-h-[560px] lg:min-h-[620px]">
      <Image
        src={heroImage}
        alt="Xe khách Hải Định"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div className="relative z-10 flex min-h-[500px] items-center py-10 sm:min-h-[560px] sm:py-14 lg:min-h-[620px] lg:py-16">
        <Container>
          <HeroContent />
        </Container>
      </div>
    </section>
  );
}