import { useEffect, useState, useRef } from "react";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-1047018783596091/4343118346";

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
  requestNonPersonalizedAdsOnly: true,
});

export function useAppInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const lastShownTime = useRef<number>(0);
  const nextActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      },
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitial.load(); // Tải sẵn quảng cáo kế tiếp
        if (nextActionRef.current) {
          nextActionRef.current();
          nextActionRef.current = null;
        }
      },
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const navigateWithAd = (callback: () => void) => {
    const now = Date.now();
    const THREE_MINUTES = 3 * 60 * 1000;

    // Kiểm tra quảng cáo đã tải xong và đã cách lần xem trước 3 phút
    if (loaded && now - lastShownTime.current >= THREE_MINUTES) {
      lastShownTime.current = now;
      nextActionRef.current = callback;
      interstitial.show();
    } else {
      callback();
    }
  };

  return { navigateWithAd };
}
