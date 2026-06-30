import Container from "@/app/components/layout/Containers";
import HeroContent from "./HeroContent";

import Image from "next/image";
import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";



export default function Hero() {
  return (
    <section className="relative min-h-[420px] overflow-hidden mt-18">
      {/* Background */}
      <Image
        src={heroImage}
        alt="Xe khách Hải Định"
        fill
        priority
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.55) 30%, rgba(0,0,0,.20) 60%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Container>
          <HeroContent />
        </Container>
      </div>
    </section>
  );
}