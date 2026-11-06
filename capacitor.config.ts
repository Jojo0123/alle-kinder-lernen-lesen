import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.extensos.kinderlernenlesen',
  appName: 'Alle Kinder lernen Lesen',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#f8f7f5'
  }
};

export default config;
