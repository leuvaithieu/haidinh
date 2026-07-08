import Hero from  "@/app/components/sections/Hero"
import QuickBooking from "@/app/components/sections/QuickBooking";
import Trips from "@/app/components/sections/Trips";
import WhyChoose from "@/app/components/sections/WhyChoose";
import News from "@/app/components/sections/News";
export default function HomePage(){
  return(
    <main>
      <Hero/>
      <QuickBooking/>
      <Trips/>
      <WhyChoose/>
      <News/>
    </main>
  )
}