
import Image from "next/image";
import Container from "@/app/components/layout/Containers";
import HeroContent from "./HeroContent";

import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";

export default function Hero() {
  return (
    <section className="relative isolate mt-16 min-h-[460px] overflow-hidden bg-neutral-950 sm:min-h-[520px] lg:mt-20 lg:min-h-[600px]">
      {/* Background image */}
      <Image
        src={heroImage}
        alt="Xe khách Hải Định"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[460px] items-center py-12 sm:min-h-[520px] sm:py-16 lg:min-h-[600px] lg:py-20">
        <Container>
          <HeroContent />
        </Container>
      </div>
    </section>
  );
}
