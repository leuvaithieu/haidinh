import { ExternalLink } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { contactInfo } from "./data";

export default function FooterFanpage() {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white sm:text-lg">
          Kết nối với Hải Định
        </h3>

        <FaFacebookF className="h-5 w-5 shrink-0 text-red-500" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white sm:mt-5">
        <div className="min-h-[280px] w-full">
          <iframe
            title="Fanpage Facebook Hải Định"
            src={contactInfo.facebookEmbed}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="block min-h-[280px] w-full border-0"
          />
        </div>
      </div>

      <a
        href={contactInfo.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-neutral-300 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Theo dõi Facebook Hải Định
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}