
import Container from "@/app/components/layout/Containers";
import BookingForm from "./BookingForm";

export default function QuickBooking() {
  return (
    <section
      id="quick-booking"
      className="relative z-20 -mt-8 scroll-mt-24 sm:-mt-10 lg:-mt-14"
    >
      <Container>
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.10)] sm:rounded-3xl sm:shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
          <BookingForm />
        </div>
      </Container>
    </section>
  );
}
