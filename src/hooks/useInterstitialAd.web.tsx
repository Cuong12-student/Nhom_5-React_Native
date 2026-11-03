export function useAppInterstitialAd() {
  const navigateWithAd = (callback: () => void) => {
    callback();
  };

  return { navigateWithAd };
}
