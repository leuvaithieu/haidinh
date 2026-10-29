
"use client";

import { useEffect, useState } from "react";
import Container from "@/app/components/layout/Containers";
import TripCard from "./TripCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getImageUrl(value) {
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!API_URL) return "";

  return `${API_URL.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

export default function Trips() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      try {
        if (!API_URL) {
          throw new Error("Thiếu NEXT_PUBLIC_API_URL");
        }

        const response = await fetch(
          `${API_URL.replace(/\/+$/, "")}/routes/website/published`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Không tải được danh sách tuyến");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu tuyến không hợp lệ");
        }

        if (!cancelled) {
          setRoutes(data);
        }
      } catch (error) {
        console.error("Lỗi tải tuyến xe:", error);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRoutes();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="san-pham-dich-vu"
      className="overflow-hidden bg-gray-50 py-12 sm:py-16 lg:py-20"
    >
      <Container>
        {/* Section heading */}
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 lg:mb-12">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-700 sm:text-sm">
            Sản phẩm & Dịch vụ
          </span>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Các tuyến xe đang khai thác
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            Khám phá các tuyến xe Hải Định, lựa chọn hành trình phù hợp
            và chủ động cho chuyến đi của bạn.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white"
              >
                <div className="h-[190px] bg-gray-200" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-5 py-10 text-center">
            <p className="text-sm text-gray-600">
              Chưa tải được danh sách tuyến xe. Vui lòng thử lại sau.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && routes.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="text-base font-semibold text-gray-800">
              Hiện chưa có tuyến xe được xuất bản.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Các tuyến sẽ xuất hiện tại đây sau khi được xuất bản trong trang quản trị.
            </p>
          </div>
        )}

        {/* Published routes */}
        {!loading && !error && routes.length > 0 && (
          <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {routes.map((route) => (
              <TripCard
                key={route.id}
                route={route}
                imageUrl={getImageUrl(route.imageUrl)}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
