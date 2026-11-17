import { MapPin, Phone, Mail, Clock3 } from "lucide-react";
import { contactInfo } from "./data";

export default function FooterInfo() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">
          {contactInfo.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-300">
          {contactInfo.slogan}
        </p>
      </div>

      <div className="space-y-3 text-sm text-gray-300">
        {/* Địa chỉ */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-red-500" />

          <a
            href={contactInfo.map}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            {contactInfo.address}
          </a>
        </div>

        {/* Danh sách số điện thoại */}
        <div className="flex items-start gap-3">
          <Phone className="mt-1 h-5 w-5 shrink-0 text-red-500" />

          <div className="flex flex-col gap-2">
            {contactInfo.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {phone}
              </a>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-red-500" />

          <a
            href={`mailto:${contactInfo.email}`}
            className="break-all transition-colors hover:text-white"
          >
            {contactInfo.email}
          </a>
        </div>

        {/* Giờ hoạt động */}
        <div className="flex items-start gap-3">
          <Clock3 className="mt-1 h-5 w-5 shrink-0 text-red-500" />

          <span>{contactInfo.workingTime}</span>
        </div>
      </div>
    </div>
  );
}