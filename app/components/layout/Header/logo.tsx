import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center"
    >
      <Image 
        src="/images/logo.png"
        alt="Hải Định"
        width={150}
        height={38}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}