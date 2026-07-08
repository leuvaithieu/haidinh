import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
} from "lucide-react";

import { companyInfo } from "./data";

export default function FooterInfo() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">
        Liên hệ
      </h3>

      <div className="mt-6 space-y-6">
        {/* Address */}
        <div className="flex items-start gap-4">
          <div className="mt-1 text-primary">
            <MapPin size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Địa chỉ
            </p>

            <Link
              href={companyInfo.map}
              target="_blank"
              className="mt-1 block leading-7 text-neutral-400 transition hover:text-white"
            >
              {companyInfo.address}
            </Link>
          </div>
        </div>

        {/* Hotline */}
        <div className="flex items-start gap-4">
          <div className="mt-1 text-primary">
            <Phone size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Hotline
            </p>

            <Link
              href={`tel:${companyInfo.phone}`}
              className="mt-1 block text-neutral-400 transition hover:text-white"
            >
              {companyInfo.phone}
            </Link>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="mt-1 text-primary">
            <Mail size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Email
            </p>

            <Link
              href={`mailto:${companyInfo.email}`}
              className="mt-1 block text-neutral-400 transition hover:text-white"
            >
              {companyInfo.email}
            </Link>
          </div>
        </div>

        {/* Working Time */}
        <div className="flex items-start gap-4">
          <div className="mt-1 text-primary">
            <Clock3 size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Giờ làm việc
            </p>

            <p className="mt-1 text-neutral-400">
              {companyInfo.workingTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}