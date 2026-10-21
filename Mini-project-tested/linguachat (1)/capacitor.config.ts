import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.linguachat.app',
  appName: 'LinguaChat',
  webDir: 'dist',
  server: {
    url: 'http://172.16.59.15:3000',
    cleartext: true,
  },
};

export default config;
