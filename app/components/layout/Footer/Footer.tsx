import Container from "../Containers";

import FooterInfo from "./FooterInfo";
import FooterMap from "./FooterMap";
import FooterFanpage from "./FooterFanpage";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <Container>
        <div className="py-10 sm:py-14 lg:py-16">
          {/* Phần giới thiệu */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-wider sm:text-3xl">
              HẢI ĐỊNH
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
              Hơn 25 năm phục vụ vận tải hành khách từ năm 2000.
              Hải Định luôn đồng hành cùng khách hàng trên mọi
              hành trình với sự an toàn, đúng giờ và tận tâm.
            </p>
          </div>

          <div className="my-8 h-px bg-white/10 sm:my-12 lg:my-14" />

          {/* Thông tin liên hệ, bản đồ và fanpage */}
          <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8">
            <div className="min-w-0">
              <FooterInfo />
            </div>

            <div className="min-w-0">
              <FooterMap />
            </div>

            <div className="min-w-0">
              <FooterFanpage />
            </div>
          </div>

          <div className="my-8 h-px bg-white/10 sm:my-10" />

          {/* Bản quyền */}
          <div className="flex flex-col items-center gap-3 text-center text-xs leading-6 text-neutral-500 sm:text-sm lg:flex-row lg:justify-between lg:text-left">
            <p>
              © {new Date().getFullYear()} Công ty TNHH Hải Định.
              All rights reserved.
            </p>

            <p>Designed & Developed by Hải Định</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}