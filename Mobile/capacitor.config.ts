import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.transescolar.app',
  appName: 'TransEscolar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
