import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Hải Định - Trang chủ"
      className="group inline-flex min-w-0 flex-col justify-center leading-none"
    >
      <span className="whitespace-nowrap text-xl font-black tracking-wide text-red-600 transition-colors group-hover:text-red-700 sm:text-2xl">
        HẢI ĐỊNH
      </span>

      <span className="mt-1 whitespace-nowrap text-[10px] font-medium text-neutral-500 sm:text-[11px]">
        Chất lượng tạo niềm tin
      </span>
    </Link>
  );
}