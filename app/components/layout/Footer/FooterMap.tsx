import Link from "next/link";

import { companyInfo } from "./data";

export default function FooterMap() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">
        Google Maps
      </h3>

      <Link
        href={companyInfo.map}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg transition hover:border-primary/50"
      >
        <iframe
          title="Google Maps"
          src={companyInfo.mapEmbed}
          width="100%"
          height="300"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none block"
        />
      </Link>
    </div>
  );
}