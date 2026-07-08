import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";


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
      </body>
    </html>
  );
}