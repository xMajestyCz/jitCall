import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jitcall.app',
  appName: 'jitCall',
  webDir: 'www',
  plugins: {
    "PushNotifications": {
        "presentationOptions": ["badge", "sound", "alert"]
    }
  },
};

export default config;
