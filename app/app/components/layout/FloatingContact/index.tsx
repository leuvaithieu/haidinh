"use client";

import { FaPhoneAlt, FaArrowUp } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { useEffect, useState } from "react";
import styles from "./FloatingContact.module.css";

export default function FloatingContact() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.wrapper}>
      <a
        href="https://m.me/xekhachhaidinhth"
        target="_blank"
        className={`${styles.button} ${styles.messenger}`}
      >
        <FaFacebookMessenger />
        <span>Messenger</span>
      </a>

      <a
        href="https://zalo.me/0982113878"
        target="_blank"
        className={`${styles.button} ${styles.zalo}`}
      >
        <SiZalo />
        <span>Zalo</span>
      </a>

      <a
        href="tel:0982113878"
        className={`${styles.button} ${styles.phone}`}
      >
        <FaPhoneAlt />
        <span>0982 113 878</span>
      </a>

      {showTop && (
        <button
          className={`${styles.button} ${styles.top}`}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}