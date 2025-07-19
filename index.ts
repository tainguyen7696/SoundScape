// index.ts
import { registerRootComponent } from 'expo';

import App from './App';

// (Optionally) force a crash to verify Crashlytics is wired up:
// crashlytics().crash();

registerRootComponent(App);
