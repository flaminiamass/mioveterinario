/* useIsMobile — hook che dice se lo schermo è piccolo (≤ 480px).
   Uso: const isMobile = useIsMobile();
   Se isMobile è true → siamo su telefono, adattiamo il layout. */

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 480;

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
