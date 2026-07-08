import Container from "../Containers";

import FooterInfo from "./FooterInfo";
import FooterMap from "./FooterMap";
import FooterFanpage from "./FooterFanpage";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <Container>
        <div className="py-16">
          {/* Top */}
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <h2 className="text-3xl font-bold tracking-wide">
              HẢI ĐỊNH
            </h2>

            {/* Slogan */}
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-400">
              Hơn 25 năm phục vụ vận tải hành khách từ năm 2000.
              Hải Định luôn đồng hành cùng khách hàng trên mọi hành
              trình với sự an toàn, đúng giờ và tận tâm.
            </p>
          </div>

          {/* Divider */}
          <div className="my-14 h-px bg-white/10" />

          {/* Main */}
          <div className="grid gap-10 lg:grid-cols-[360px_1fr_1fr]">
            <FooterInfo />

            <FooterMap />

            <FooterFanpage />
          </div>

          {/* Divider */}
          <div className="my-12 h-px bg-white/10" />

          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-neutral-500 lg:flex-row">
            <p>
              © {new Date().getFullYear()} Công ty TNHH Hải Định.
              All rights reserved.
            </p>

            <p>
              Designed & Developed by Hải Định
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}