// index.ts
import crashlytics from '@react-native-firebase/crashlytics';
import { registerRootComponent } from 'expo';

import App from './App';

// Log a startup breadcrumb
crashlytics().log('🚀 App starting');

// (Optionally) force a crash to verify Crashlytics is wired up:
// crashlytics().crash();

registerRootComponent(App);
