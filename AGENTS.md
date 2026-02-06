# AGENTS.md

# react-native-okhi - Agent Integration Guide

This document provides complete instructions for AI agents to integrate the OkHi address verification SDK into React Native applications.

## Overview

`react-native-okhi` is a React Native library for address verification using OkHi's digital and physical verification methods. It supports both bare React Native projects and Expo projects (with development builds).

## Quick Reference

```typescript
import * as OkHi from 'react-native-okhi';

// Login (required before any verification)
await OkHi.login({ auth, user });

// Verification methods
await OkHi.startDigitalAddressVerification(config?);
await OkHi.startPhysicalAddressVerification(config?);
await OkHi.startDigitalAndPhysicalAddressVerification(config?);

// Create address without verification (verify later)
await OkHi.createAddress(config?);

// Permission helpers (optional — the SDK handles permissions internally)
await OkHi.isLocationServicesEnabled();
await OkHi.isFineLocationPermissionGranted();
await OkHi.isBackgroundLocationPermissionGranted();
await OkHi.requestLocationPermission();
await OkHi.requestBackgroundLocationPermission();
await OkHi.requestEnableLocationServices();
```

---

## Installation

### For Bare React Native Projects

```bash
# Using npm
npm install react-native-okhi

# Using yarn
yarn add react-native-okhi
```

After installation, run:

```bash
# iOS
cd ios && pod install && cd ..
```

### For Expo Projects

Expo projects require a **development build** (this library will NOT work with Expo Go).

```bash
# Install the library
npx expo install react-native-okhi

# Generate native directories
npx expo prebuild

# Run development build
npx expo run:ios
# or
npx expo run:android
```

---

## Android Configuration

### 1. Add OkHi Maven Repository

Edit `android/build.gradle` to add the OkHi Maven repository:

```gradle
buildscript {
    ext {
        buildToolsVersion = "35.0.0"
        minSdkVersion = 24
        compileSdkVersion = 35
        targetSdkVersion = 35
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.0.21"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

allprojects {
    repositories {
        maven { url "https://repo.okhi.io/artifactory/maven" } // ADD THIS LINE
    }
}

apply plugin: "com.facebook.react.rootproject"
```

### 2. Set SDK Versions

Ensure `android/app/build.gradle` has the correct SDK versions:

```gradle
android {
    compileSdk = 35  // or higher

    defaultConfig {
        minSdk = 24      // minimum 21, recommended 24
        targetSdk = 35   // or higher
    }
}
```

### 3. Add Required Permissions

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- Internet access -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Notifications (for foreground service) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Foreground services -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission
        android:name="android.permission.FOREGROUND_SERVICE"
        android:foregroundServiceType="location" />

    <application ...>
        <!-- Activities and other components -->
    </application>
</manifest>
```

### 4. Customize Foreground Service Notification (Optional)

When address verification is running, Android shows a persistent notification. Customize it by adding `<meta-data>` tags inside the `<application>` block:

```xml
<application
    android:name=".MainApplication"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name">

    <!-- Custom notification title -->
    <meta-data
        android:name="io.okhi.android.notification_title"
        android:value="Address verification" />

    <!-- Custom notification message -->
    <meta-data
        android:name="io.okhi.android.notification_text"
        android:value="Verifying your address" />

    <!-- Custom notification icon (use your app's drawable) -->
    <meta-data
        android:name="io.okhi.android.notification_icon"
        android:resource="@drawable/ic_notification" />

    <!-- ... rest of application -->
</application>
```

---

## iOS Configuration

### 1. Add Location Permissions

Edit `ios/[YourAppName]/Info.plist` to add location permission descriptions:

```xml
<dict>
    <!-- ... other entries ... -->

    <key>NSLocationAlwaysUsageDescription</key>
    <string>Grant to enable verifying your addresses.</string>

    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Grant to enable creating addresses at your current location.</string>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>Grant to enable creating and verifying your addresses.</string>
</dict>
```

### 2. Enable Background Modes

In Xcode:

1. Open your project in Xcode
2. Select your target
3. Go to **Signing & Capabilities**
4. Click **+ Capability** and add **Background Modes**
5. Enable:
   - ✅ **Location updates**
   - ✅ **Background fetch**

Or add to `Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
</array>
```

### 3. Configure AppDelegate

Add the OkHi monitoring start call to your AppDelegate.

**For Swift (AppDelegate.swift):**

```swift
import UIKit
import OkHi

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        OK.startMonitoring() // ADD THIS LINE
        return true
    }
}
```

**For Objective-C (AppDelegate.mm or AppDelegate.m):**

```objc
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
@import OkHi;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [OK startMonitoring]; // ADD THIS LINE

  self.moduleName = @"YourAppName";
  self.initialProps = @{};
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// ... rest of AppDelegate
@end
```

---

## Usage Guide

### Import Pattern

Always import as a namespace:

```typescript
import * as OkHi from 'react-native-okhi';
```

For types, use type imports:

```typescript
import type {
  OkHiLogin,
  OkCollect,
  OkHiSuccessResponse,
} from 'react-native-okhi';
```

### Step 1: Login

Login must be called before any verification. It initializes the SDK with your credentials and user information.

> **When to call login:** The login function should be called once you have an authenticated user in your app. A common place to call login is immediately after the app dashboard is rendered, for example in a banking app after a user successfully signs in. It initializes OkHi and enables your users to resume verification if they switch devices, as well as enables re-verification of previously unknown addresses.

```typescript
import * as OkHi from 'react-native-okhi';
import type { OkHiLogin } from 'react-native-okhi';

const credentials: OkHiLogin = {
  auth: {
    branchId: 'your_branch_id',
    clientKey: 'your_client_key',
  },
  user: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+254712345678', // International format, must be a real phone number
    email: 'john.doe@example.com',
  },
};

await OkHi.login(credentials);
```

### Step 2: Start Verification

> **Important:** You do NOT need to manually request permissions before calling verification methods. The SDK handles all required permissions (location, background location, notifications) internally. Just call the verification method directly — the library will prompt the user for any missing permissions as part of the flow.
>
> **Do NOT** write a `requestPermissions` function that manually checks and requests each permission. This is unnecessary and creates a worse user experience.

#### Digital Verification (Fastest)

Verifies address using GPS, WiFi, and cellular signals remotely:

```typescript
const result = await OkHi.startDigitalAddressVerification();
console.log('Location ID:', result.location.id);
console.log('Address:', result.location.formattedAddress);
```

#### Physical Verification

Schedules an OkHi agent to visit and verify the address in person:

```typescript
const result = await OkHi.startPhysicalAddressVerification();
// Store result.location.id to track verification status via webhooks
```

#### Combined Verification

Both digital and physical verification for maximum confidence:

```typescript
const result = await OkHi.startDigitalAndPhysicalAddressVerification();
```

### Create Address Now, Verify Later

Create an address without verification, then verify it later using the `locationId`:

```typescript
// Step 1: Create the address
const result = await OkHi.createAddress();
const locationId = result.location.id;

// Save locationId to your database
await saveToDatabase({ userId: currentUser.id, locationId });

// Step 2: Later, verify the saved address
const savedLocationId = await fetchFromDatabase(currentUser.id);
const verificationResult = await OkHi.startDigitalAddressVerification({
  locationId: savedLocationId,
});
```

### Customize the UI

Pass an `OkCollect` configuration to customize appearance and behavior:

```typescript
import type { OkCollect } from 'react-native-okhi';

const config: OkCollect = {
  style: {
    color: '#FF5722', // Your brand color (hex)
    logo: 'https://example.com/logo.png', // Your logo URL
  },
  configuration: {
    streetView: true, // Enable Street View (default: true)
    withHomeAddressType: true, // Show "Home" option (default: true)
    withWorkAddressType: true, // Show "Work" option (default: false)
  },
};

const result = await OkHi.startDigitalAddressVerification(config);
```

---

## Error Handling

All verification functions throw `OkHiException` on failure. Use the static code constants for type-safe error handling:

```typescript
import * as OkHi from 'react-native-okhi';

try {
  const result = await OkHi.startDigitalAddressVerification();
  console.log('Success:', result.location.formattedAddress);
} catch (error) {
  if (error instanceof OkHi.OkHiException) {
    switch (error.code) {
      case OkHi.OkHiException.USER_CLOSED:
        // User dismissed the verification flow
        console.log('User cancelled');
        break;
      case OkHi.OkHiException.NETWORK_ERROR:
        // Network connectivity issue
        console.log('Check your internet connection');
        break;
      case OkHi.OkHiException.PERMISSION_DENIED:
        // Location permission not granted
        console.log('Location permission required');
        break;
      case OkHi.OkHiException.UNAUTHENTICATED:
        // Need to call login() first
        console.log('Please login first');
        break;
      case OkHi.OkHiException.INVALID_PHONE:
        // Phone number format is invalid
        console.log('Invalid phone number');
        break;
      case OkHi.OkHiException.SERVICE_UNAVAILABLE:
        // OkHi service is down
        console.log('Service temporarily unavailable');
        break;
      case OkHi.OkHiException.UNSUPPORTED_DEVICE:
        // Device not supported (e.g., no Play Services)
        console.log('Device not supported');
        break;
      case OkHi.OkHiException.FATAL_EXIT:
        // SDK crashed unexpectedly
        console.log('Fatal error occurred');
        break;
      default:
        console.log('Error:', error.code, error.message);
    }
  }
}
```

### Error Codes Reference

| Code                  | Constant                            | Description                          |
| --------------------- | ----------------------------------- | ------------------------------------ |
| `user_closed`         | `OkHiException.USER_CLOSED`         | User dismissed the verification flow |
| `network_error`       | `OkHiException.NETWORK_ERROR`       | Network connectivity issue           |
| `permission_denied`   | `OkHiException.PERMISSION_DENIED`   | Location permission not granted      |
| `unauthenticated`     | `OkHiException.UNAUTHENTICATED`     | Must call `login()` first            |
| `invalid_phone`       | `OkHiException.INVALID_PHONE`       | Phone number format invalid          |
| `service_unavailable` | `OkHiException.SERVICE_UNAVAILABLE` | OkHi service temporarily down        |
| `unsupported_device`  | `OkHiException.UNSUPPORTED_DEVICE`  | Device not supported                 |
| `fatal_exit`          | `OkHiException.FATAL_EXIT`          | SDK crashed unexpectedly             |
| `unknown`             | `OkHiException.UNKNOWN`             | Unexpected error                     |

---

## Permission Helper Functions (Optional — Advanced Use Only)

> **Note:** You do NOT need to use these functions for a standard integration. The verification methods (`startDigitalAddressVerification`, `startPhysicalAddressVerification`, etc.) handle all required permissions internally. These helpers are exposed only for advanced use cases, such as building custom pre-flight checks or diagnostic screens. **Do not call these before starting verification — the SDK already does this for you.**

### Check Permissions

```typescript
// Check if device location services are enabled
const locationEnabled = await OkHi.isLocationServicesEnabled();

// Check fine (precise) location permission
const hasFineLocation = await OkHi.isFineLocationPermissionGranted();

// Check coarse (approximate) location permission
const hasCoarseLocation = await OkHi.isCoarseLocationPermissionGranted();

// Check background location permission (needed for physical verification)
const hasBackgroundLocation =
  await OkHi.isBackgroundLocationPermissionGranted();

// Check notification permission (Android only)
const hasNotifications = await OkHi.isPostNotificationPermissionGranted();

// Check Google Play Services availability (Android only)
const hasPlayServices = await OkHi.isPlayServicesAvailable();

// Get current location accuracy level: 'precise' | 'approximate' | 'none'
const accuracy = await OkHi.getLocationAccuracyLevel();
```

### Request Permissions

```typescript
// Request foreground location permission
const granted = await OkHi.requestLocationPermission();

// Request background location permission (requires foreground first)
const bgGranted = await OkHi.requestBackgroundLocationPermission();

// Prompt user to enable location services
const enabled = await OkHi.requestEnableLocationServices();

// Request notification permission (Android 13+ only)
import { Platform } from 'react-native';
if (Platform.OS === 'android') {
  const notifGranted = await OkHi.requestPostNotificationPermissions();
}
```

### Protected Apps (Android)

Some Android devices (Xiaomi, Huawei, Oppo, etc.) have aggressive battery optimization. Guide users to whitelist your app:

```typescript
const canOpen = await OkHi.canOpenProtectedApps();
if (canOpen) {
  // Show explanation to user, then:
  await OkHi.openProtectedApps();
}
```

---

## Complete Integration Example

```typescript
// App.tsx or a verification screen
import React, { useState } from 'react';
import { View, Button, Text, Alert, Platform } from 'react-native';
import * as OkHi from 'react-native-okhi';
import type {
  OkHiLogin,
  OkCollect,
  OkHiSuccessResponse,
} from 'react-native-okhi';

const OKHI_BRANCH_ID = 'your_branch_id';
const OKHI_CLIENT_KEY = 'your_client_key';

export default function AddressVerificationScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Call login once you have an authenticated user in your app.
  // A common place is immediately after the app dashboard is rendered,
  // e.g., in a banking app after a user successfully signs in.
  // It initializes OkHi and enables users to resume verification if they
  // switch devices, as well as enables re-verification of previously unknown addresses.
  const handleLogin = async () => {
    const credentials: OkHiLogin = {
      auth: {
        branchId: OKHI_BRANCH_ID,
        clientKey: OKHI_CLIENT_KEY,
      },
      user: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        email: 'john@example.com',
      },
    };

    await OkHi.login(credentials);
    setIsLoggedIn(true);
  };

  const handleVerifyAddress = async () => {
    try {
      const config: OkCollect = {
        style: {
          color: '#6200EE',
          logo: 'https://your-company.com/logo.png',
        },
        configuration: {
          streetView: true,
          withHomeAddressType: true,
          withWorkAddressType: true,
        },
      };

      const result: OkHiSuccessResponse =
        await OkHi.startDigitalAddressVerification(config);

      setAddress(result.location.formattedAddress || 'Address verified');

      // Save to your backend
      console.log('Location ID:', result.location.id);
      console.log('Coordinates:', result.location.lat, result.location.lng);
    } catch (error) {
      if (error instanceof OkHi.OkHiException) {
        switch (error.code) {
          case OkHi.OkHiException.USER_CLOSED:
            // User cancelled - do nothing
            break;
          case OkHi.OkHiException.NETWORK_ERROR:
            Alert.alert(
              'Network Error',
              'Please check your internet connection'
            );
            break;
          case OkHi.OkHiException.PERMISSION_DENIED:
            Alert.alert('Permission Required', 'Location permission is needed');
            break;
          default:
            Alert.alert('Error', error.message);
        }
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {!isLoggedIn ? (
        <Button title="Login to OkHi" onPress={handleLogin} />
      ) : (
        <>
          <Button
            title="Verify Address (Digital)"
            onPress={handleVerifyAddress}
          />
          <View style={{ height: 20 }} />
        </>
      )}

      {address && <Text style={{ marginTop: 20 }}>Verified: {address}</Text>}
    </View>
  );
}
```

---

## API Reference

### Functions

| Function                                              | Returns                        | Description                                        |
| ----------------------------------------------------- | ------------------------------ | -------------------------------------------------- |
| `login(credentials)`                                  | `Promise<string[] \| null>`    | Authenticate with OkHi                             |
| `startDigitalAddressVerification(config?)`            | `Promise<OkHiSuccessResponse>` | Start digital verification                         |
| `startPhysicalAddressVerification(config?)`           | `Promise<OkHiSuccessResponse>` | Start physical verification                        |
| `startDigitalAndPhysicalAddressVerification(config?)` | `Promise<OkHiSuccessResponse>` | Start both verifications                           |
| `createAddress(config?)`                              | `Promise<OkHiSuccessResponse>` | Create address without verification                |
| `isLocationServicesEnabled()`                         | `Promise<boolean>`             | Check device location services                     |
| `isFineLocationPermissionGranted()`                   | `Promise<boolean>`             | Check precise location permission                  |
| `isCoarseLocationPermissionGranted()`                 | `Promise<boolean>`             | Check approximate location permission              |
| `isBackgroundLocationPermissionGranted()`             | `Promise<boolean>`             | Check background location permission               |
| `isPostNotificationPermissionGranted()`               | `Promise<boolean>`             | Check notification permission                      |
| `isPlayServicesAvailable()`                           | `Promise<boolean>`             | Check Google Play Services (Android)               |
| `getLocationAccuracyLevel()`                          | `Promise<string>`              | Get accuracy: 'precise' \| 'approximate' \| 'none' |
| `requestLocationPermission()`                         | `Promise<boolean>`             | Request foreground location                        |
| `requestBackgroundLocationPermission()`               | `Promise<boolean>`             | Request background location                        |
| `requestEnableLocationServices()`                     | `Promise<boolean>`             | Prompt to enable location services                 |
| `requestPostNotificationPermissions()`                | `Promise<boolean>`             | Request notifications (Android only)               |
| `canOpenProtectedApps()`                              | `Promise<boolean>`             | Check if protected apps settings available         |
| `openProtectedApps()`                                 | `Promise<void>`                | Open protected apps settings                       |

### Types

| Type                  | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `OkHiLogin`           | Login configuration (auth + user + options)             |
| `OkHiAuth`            | Authentication credentials (branchId, clientKey)        |
| `OkHiUser`            | User information (name, phone, email)                   |
| `OkCollect`           | Verification UI configuration                           |
| `OkCollectStyle`      | UI styling (color, logo)                                |
| `OkCollectConfig`     | UI behavior (streetView, addressTypes)                  |
| `OkHiSuccessResponse` | Verification result (user + location)                   |
| `OkHiLocation`        | Address data (id, coordinates, formatted address, etc.) |
| `OkHiException`       | Error class with code and message                       |
| `OkHiErrorCode`       | Union type of all error codes                           |

---

## Troubleshooting

### Android: "Maven repository not found"

Ensure you added the OkHi Maven repository to `android/build.gradle` in the `allprojects.repositories` block.

### iOS: "OkHi module not found"

Run `pod install` in the `ios` directory:

```bash
cd ios && pod install && cd ..
```

### Expo: "Native module not found"

Expo Go doesn't support native modules. Use a development build:

```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

### Android: App killed in background

Some devices aggressively kill background apps. Check and guide users:

```typescript
const canOpen = await OkHi.canOpenProtectedApps();
if (canOpen) {
  await OkHi.openProtectedApps();
}
```

### Error: UNAUTHENTICATED

Make sure to call `OkHi.login()` before any verification function.
