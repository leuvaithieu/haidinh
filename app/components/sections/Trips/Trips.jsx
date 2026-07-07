import Container from "@/app/components/layout/Containers";
import TripCard from "./TripCard";

export default function Trips() {
  return (
    <section className="py-16">
      <Container>
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            TUYẾN XE
          </span>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Tuyến đang khai thác
          </h2>

          <p className="mt-2 text-gray-500">
            Lựa chọn tuyến phù hợp với hành trình của bạn.
          </p>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          <TripCard />
          <TripCard />
          <TripCard />
          <TripCard />
          <TripCard />
          <TripCard />
        </div>
      </Container>
    </section>
  );
}