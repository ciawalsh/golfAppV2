import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SweetSpot Golf',
  slug: 'sweetspot-golf',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'sweetspot',
  splash: {
    image: './assets/images/LogoWhite.png',
    resizeMode: 'contain',
    backgroundColor: '#1e2c3a',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.wel.golfApp',
    appleTeamId: 'S42CL9TBNR',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#1e2c3a',
    },
    package: 'com.wel.golfApp',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-router',
      {
        origin: 'https://sweetspot.golf',
      },
    ],
    'expo-apple-authentication',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.1078008179805-rrfpgq6ljf79mvqbkt2j0r13d1lubs3r',
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        organization: 'sweetspot-golf',
        project: 'sweetspot-mobile',
      },
    ],
    'expo-video',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'SweetSpot Golf uses your location to find nearby courses and track shots on the course.',
        locationWhenInUsePermission:
          'SweetSpot Golf uses your location to find nearby courses and track shots on the course.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'SweetSpot Golf uses your photos to set your profile picture.',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '4adab793-ced8-4032-8416-b721268e4443',
    },
    googleSignInWebClientId: process.env.GOOGLE_SIGNIN_WEB_CLIENT_ID,
    googleSignInIosClientId: process.env.GOOGLE_SIGNIN_IOS_CLIENT_ID,
  },
});
