export const adManager = {
  config: {
    publisherId: "pub-XXXXXXXXXXXXXXXX",
    interstitialInterval: 5 * 60 * 1000, // 5 minutes
  },

  state: {
    lastInterstitialShow: 0,
  },

  canShowInterstitial: (): boolean => {
    const now = Date.now();
    if (
      now - adManager.state.lastInterstitialShow >
      adManager.config.interstitialInterval
    ) {
      return true;
    }
    return false;
  },

  recordInterstitialShow: () => {
    adManager.state.lastInterstitialShow = Date.now();
  },

  // Mock function to simulate loading an ad
  loadAd: async (type: "interstitial" | "rewarded") => {
    console.log(`Loading ${type} ad...`);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
};
