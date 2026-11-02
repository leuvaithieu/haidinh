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

  async function retryLoadRoutes() {
    setLoading(true);
    setError(false);

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

      setRoutes(data);
    } catch (error) {
      console.error("Lỗi tải tuyến xe:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="san-pham-dich-vu"
      className="overflow-hidden bg-gray-50 py-10 sm:py-14 lg:py-20"
    >
      <Container>
        {/* Tiêu đề section */}
        <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-10 lg:mb-12">
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-red-700 sm:px-4 sm:py-2 sm:text-xs">
            Sản phẩm & Dịch vụ
          </span>

          <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-gray-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Các tuyến xe đang khai thác
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            Khám phá các tuyến xe Hải Định, lựa chọn hành trình phù hợp
            và chủ động cho chuyến đi của bạn.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6 lg:gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white sm:rounded-3xl lg:col-span-2 ${
                  item === 4
                    ? "lg:col-start-2"
                    : item === 5
                      ? "lg:col-start-4"
                      : ""
                }`}
              >
                <div className="h-44 bg-gray-200 sm:h-48" />

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
              Chưa tải được danh sách tuyến xe. Vui lòng thử lại.
            </p>

            <button
              type="button"
              onClick={retryLoadRoutes}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Không có tuyến */}
        {!loading && !error && routes.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center sm:py-12">
            <p className="text-base font-semibold text-gray-800">
              Hiện chưa có tuyến xe được xuất bản.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Các tuyến sẽ xuất hiện tại đây sau khi được xuất bản trong trang quản trị.
            </p>
          </div>
        )}

        {/* Danh sách tuyến xe */}
        {!loading && !error && routes.length > 0 && (
          <div className="-mx-4 sm:mx-0">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6 lg:gap-6">
              {routes.map((route, index) => (
                <div
                  key={route.id}
                  className={`w-[84%] min-w-0 max-w-[360px] shrink-0 snap-start sm:w-full sm:max-w-none sm:shrink lg:col-span-2 ${
                    index === 3
                      ? "lg:col-start-2"
                      : index === 4
                        ? "lg:col-start-4"
                        : ""
                  }`}
                >
                  <TripCard
                    route={route}
                    imageUrl={getImageUrl(route.imageUrl)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}