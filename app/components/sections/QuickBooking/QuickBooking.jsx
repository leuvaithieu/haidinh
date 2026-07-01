import Container from "@/app/components/layout/Containers";
import BookingForm from "./BookingForm";

export default function QuickBooking() {
    return (
      <section className="relative z-20 -mt-10 lg:-mt-16">
        <Container>
          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,.08)]">
            <BookingForm />
          </div>
        </Container>
      </section>
    );
}