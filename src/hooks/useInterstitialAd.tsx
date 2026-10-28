import { useState, useRef } from "react";

export function useAppInterstitialAd() {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const lastShownTime = useRef<number>(0);
  const nextActionRef = useRef<(() => void) | null>(null);

  const navigateWithAd = (callback: () => void) => {
    const now = Date.now();
    const THREE_MINUTES = 3 * 60 * 1000;

    if (now - lastShownTime.current >= THREE_MINUTES) {
      lastShownTime.current = now;
      nextActionRef.current = callback;
      setIsAdVisible(true);
    } else {
      callback();
    }
  };

  const handleCloseAd = () => {
    setIsAdVisible(false);
    if (nextActionRef.current) {
      nextActionRef.current();
      nextActionRef.current = null;
    }
  };

  return { isAdVisible, navigateWithAd, handleCloseAd };
}
