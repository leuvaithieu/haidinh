import { MapPin, ExternalLink } from "lucide-react";
import { contactInfo } from "./data";

export default function FooterMap() {
  return (
    <div className="min-w-0">
      <h3 className="text-lg font-semibold text-white">
        Vị trí nhà xe
      </h3>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg">
        <iframe
          title="Vị trí Công ty TNHH Hải Định trên Google Maps"
          src={contactInfo.mapEmbed}
          width="100%"
          height="280"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full"
        />
      </div>

      <a
        href={contactInfo.map}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-white"
      >
        <MapPin className="h-4 w-4 text-red-500" />
        Xem đường đi trên Google Maps
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}