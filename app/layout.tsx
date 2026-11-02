import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import FloatingContact from "./components/layout/FloatingContact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Nhà xe Hải Định | Đặt vé xe khách",
    template: "%s | Nhà xe Hải Định",
  },
  description:
    "Nhà xe Hải Định phục vụ vận tải hành khách tuyến Thanh Hóa - Bình Dương và các tuyến liên quan. Tra cứu lịch trình và liên hệ đặt vé.",
  icons: {
    icon: "/favicon.ico",
  },
};


const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body>
        <Header />
        {children}
        <Footer/>
        <FloatingContact/>
      </body>
    </html>
  );
}