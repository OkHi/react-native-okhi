<div align="left">

# react-native-okhi

[![npm version](https://img.shields.io/npm/v/react-native-okhi.svg?style=flat-square)](https://www.npmjs.com/package/react-native-okhi)
[![license](https://img.shields.io/npm/l/react-native-okhi.svg?style=flat-square)](https://github.com/OkHi/react-native-okhi/blob/master/LICENSE)
[![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey?style=flat-square)](#requirements)
[![CI](https://img.shields.io/github/actions/workflow/status/OkHi/react-native-okhi/ci.yml?branch=master&style=flat-square)](https://github.com/OkHi/react-native-okhi/actions/workflows/ci.yml)

</div>

## Quick Start

### 1. Install

```bash
npm install react-native-okhi
# or
yarn add react-native-okhi
```

### 2. Configure native projects

<details>
<summary><b>iOS Setup</b></summary>

Install pods:

```bash
cd ios && pod install && cd ..
```

Add to `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Grant to enable creating addresses at your current location.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Grant to enable creating and verifying your addresses.</string>
```

Enable Background Modes in Xcode → Signing & Capabilities:

- ✅ Location updates
- ✅ Background fetch

Add to `AppDelegate.mm`:

```objc
@import OkHi;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [OK startMonitoring];
  // ... rest of your code
}
```

If using swift `AppDelegate.swift`:

```swift
import OkHi

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    OK.startMonitoring() // add this
    return true
  }
}
```

</details>

<details>
<summary><b>Android Setup</b></summary>

Add OkHi Maven repository to `android/build.gradle`:

```gradle
allprojects {
    repositories {
        maven { url "https://repo.okhi.io/artifactory/maven" }
    }
}
```

Add permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" android:foregroundServiceType="location" />
```

</details>

<details>
<summary><b>Expo Setup</b></summary>

> **Note:** Requires a development build. This library won't work with Expo Go.

```bash
npx expo install react-native-okhi
npx expo prebuild
npx expo run:ios  # or run:android
```

</details>

### 3. Verify an address

```typescript
import * as OkHi from 'react-native-okhi';

// Step 1
await OkHi.login({
  auth: {
    branchId: 'YOUR_BRANCH_ID',
    clientKey: 'YOUR_CLIENT_KEY',
  },
  user: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+254712345678',
    email: 'john@example.com',
  },
});

// Step 2
const { user, location } = await OkHi.startDigitalAddressVerification();
```

### Full Example

```tsx
import { Button, Text, View } from 'react-native';
import * as OkHi from 'react-native-okhi';

export default function Dashboard() {
  useEffect(() => {
    OkHi.login({
      auth: { branchId: 'YOUR_BRANCH_ID', clientKey: 'YOUR_CLIENT_KEY' },
      user: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        email: 'john@example.com',
      },
    }).then(() => console.log('user logged in'));
  }, []);

  const onButtonPress = async () => {
    const { user, location } = await OkHi.startDigitalAddressVerification();
    console.log(`started verification for: ${location.id}`);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Verify Address" onPress={onButtonPress} />
    </View>
  );
}
```

## Documentation

- [Official Guide](https://docs.okhi.com/latest/code-libraries/react-native-guide) — Full integration guide
- [AGENTS.md](./AGENTS.md) — AI agent integration reference

## License

MIT © [OkHi](https://okhi.co)
