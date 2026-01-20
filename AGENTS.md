# React Native OkHi SDK - AI Agent Integration Guide

This guide provides comprehensive instructions for AI agents to integrate the React Native OkHi SDK into mobile applications. OkHi provides address verification services for emerging markets where traditional addressing systems are unreliable.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Native Setup](#native-setup)
   - [Android Configuration](#android-configuration)
   - [iOS Configuration](#ios-configuration)
5. [React Native Integration](#react-native-integration)
6. [Verification Types](#verification-types)
7. [UI Customization](#ui-customization)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Complete Integration Example](#complete-integration-example)

---

## Overview

The React Native OkHi SDK enables address verification through four methods:

| Verification Type | Function | Description | Use Case |
|-------------------|----------|-------------|----------|
| **Digital** | `startAddressVerification()` | Collects location signals from user's device | Default, fastest verification |
| **Physical** | `startPhysicalAddressVerification()` | Triggers physical site visits by verification partners | High-value transactions, regulatory compliance |
| **DigitalAndPhysical** | `startDigitalAndPhysicalAddressVerification()` | Combines digital + physical verification | Maximum confidence required |
| **AddressBook** | `createAddress()` | Creates and stores address without immediate verification | Onboarding, address collection |

---

## Prerequisites

Before integration, ensure you have:

- [ ] OkHi credentials (`branchId` and `clientKey`) from the OkHi dashboard
- [ ] React Native 0.70+ project
- [ ] Android SDK 21+ (Android 5.0 Lollipop)
- [ ] iOS 12.0+
- [ ] Google Play Services (Android only)

---

## Installation

```bash
# Using npm
npm install react-native-okhi react-native-nitro-modules

# Using yarn
yarn add react-native-okhi react-native-nitro-modules
```

For iOS, install CocoaPods dependencies:

```bash
cd ios && pod install && cd ..
```

---

## Native Setup

### Android Configuration

#### 1. Add OkHi Maven Repository

In `android/settings.gradle`, add the OkHi Maven repository:

```gradle
dependencyResolutionManagement {
    repositories {
        // ... existing repositories
        maven { url "https://repo.okhi.io/artifactory/maven" }
    }
}
```

#### 2. Configure Build Settings

In `android/app/build.gradle`, ensure minimum SDK requirements:

```gradle
android {
    compileSdk 34  // or higher

    defaultConfig {
        minSdk 21
        targetSdk 34  // or higher
    }
}
```

#### 3. Add Required Permissions

In `android/app/src/main/AndroidManifest.xml`, add these permissions **before** the `<application>` tag:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- Network -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Notifications (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Foreground service for background location -->
    <uses-permission
        android:name="android.permission.FOREGROUND_SERVICE"
        android:foregroundServiceType="location" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

    <application ...>
```

---

### iOS Configuration

#### 1. Add Info.plist Permissions

In `ios/[YourApp]/Info.plist`, add location permission descriptions:

```xml
<dict>
    <!-- Location permissions -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>We need your location to verify your address</string>

    <key>NSLocationAlwaysUsageDescription</key>
    <string>We need background location access to complete address verification</string>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>We need location access to verify your address. Background access ensures verification completes even when the app is closed.</string>
</dict>
```

#### 2. Enable Background Capabilities

In Xcode:

1. Select your project target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **Background Modes**
5. Enable:
   - [x] Location updates
   - [x] Background fetch

Alternatively, add to `ios/[YourApp]/[YourApp].entitlements`:

```xml
<dict>
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
        <string>fetch</string>
    </array>
</dict>
```

#### 3. Initialize Background Monitoring

In `ios/[YourApp]/AppDelegate.mm` (or `.swift`), add initialization:

**Objective-C:**
```objc
#import <OkHi/OkHi.h>

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    [OK startMonitoring];

    // ... rest of initialization
    return YES;
}
```

**Swift:**
```swift
import OkHi

func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

    OK.startMonitoring()

    // ... rest of initialization
    return true
}
```

---

## React Native Integration

### Basic Integration Flow

```typescript
import {
  login,
  logout,
  startAddressVerification,
  startPhysicalAddressVerification,
  startDigitalAndPhysicalAddressVerification,
  createAddress,
} from 'react-native-okhi';

// Types for reference
import type { OkHiLogin, OkHiSuccessResponse, OkHiException } from 'react-native-okhi';
```

### Step 1: Login User

Call `login()` immediately after your user authenticates in your app:

```typescript
async function initializeOkHi(authenticatedUser: YourUserType) {
  const credentials: OkHiLogin = {
    auth: {
      branchId: 'your-branch-id',      // From OkHi dashboard
      clientKey: 'your-client-key',    // From OkHi dashboard
      env: 'prod',                      // Optional: 'sandbox' for testing
    },
    user: {
      firstName: authenticatedUser.firstName,
      lastName: authenticatedUser.lastName,
      phone: authenticatedUser.phone,   // MSISDN format: +254712345678
      email: authenticatedUser.email,
      appUserId: authenticatedUser.id,  // Your app's user ID
    },
    appContext: {
      name: 'Your App Name',
      version: '1.0.0',
      build: '1',
    },
  };

  try {
    await login(credentials);
    console.log('OkHi initialized successfully');
  } catch (error) {
    console.error('OkHi initialization failed:', error);
  }
}
```

### Step 2: Start Address Verification

After successful login, you can immediately call any verification function. The library handles permissions internally.

```typescript
async function verifyUserAddress() {
  try {
    const result: OkHiSuccessResponse = await startAddressVerification();

    // Extract important data
    const { user, location } = result;

    console.log('Verification started!');
    console.log('Location ID:', location.id);           // Store this!
    console.log('Address:', location.formattedAddress);
    console.log('Coordinates:', location.lat, location.lng);

    // Send to your backend
    await saveLocationToServer({
      locationId: location.id,
      userId: user.appUserId,
      address: location.formattedAddress,
      coordinates: { lat: location.lat, lng: location.lng },
    });

  } catch (error: OkHiException) {
    console.error('Verification failed:', error.code, error.message);
    handleVerificationError(error);
  }
}
```

### Step 3: Logout

When your user logs out:

```typescript
async function handleUserLogout() {
  await logout();  // Stops all OkHi signal collection
  // ... rest of your logout logic
}
```

---

## Verification Types

### Digital Verification

Collects location signals from the device. No physical visits required. This is the default and fastest verification method.

```typescript
import { startAddressVerification } from 'react-native-okhi';

const result = await startAddressVerification();
```

### Physical Verification

Triggers a physical site visit from OkHi's verification partner network. Use for high-value transactions or regulatory compliance.

```typescript
import { startPhysicalAddressVerification } from 'react-native-okhi';

const result = await startPhysicalAddressVerification();
```

### DigitalAndPhysical Verification

Combines both methods for maximum confidence. Immediately starts digital signal collection while scheduling a physical site visit.

```typescript
import { startDigitalAndPhysicalAddressVerification } from 'react-native-okhi';

const result = await startDigitalAndPhysicalAddressVerification();
```

### AddressBook (createAddress)

Create and store an address without triggering immediate verification. Useful for onboarding flows where you want to collect addresses first and verify later.

```typescript
import { createAddress, startAddressVerification } from 'react-native-okhi';

// During onboarding - just collect the address
const addressResult = await createAddress();
const locationId = addressResult.location.id;

// Store locationId in your database...

// Later, when you want to verify the stored address
const verificationResult = await startAddressVerification({
  okcollect: {
    locationId: locationId,  // Re-use the stored address
  },
});
```

---

## UI Customization

Customize the OkCollect address collection UI with your brand:

```typescript
import { startAddressVerification } from 'react-native-okhi';
import type { OkCollect } from 'react-native-okhi';

const okcollect: OkCollect = {
  style: {
    color: '#1A73E8',                           // Primary brand color (hex)
    name: 'Your Company Name',                  // Displayed in UI
    logo: 'https://yourcdn.com/logo.png',       // Logo URL
  },
  configuration: {
    streetView: true,                           // Enable Street View capture
    withAppBar: true,                           // Show app bar
  },
  // Optional: Re-use existing address
  locationId: 'previous-location-id',
};

const result = await startAddressVerification({ okcollect });
```

---

## Error Handling

```typescript
import type { OkHiException } from 'react-native-okhi';

function handleVerificationError(error: OkHiException) {
  switch (error.code) {
    case 'network_error':
      Alert.alert('Connection Error', 'Please check your internet connection');
      break;
    case 'permission_denied':
      Alert.alert('Permission Required', 'Location permission is needed');
      break;
    case 'unsupported_device':
      Alert.alert('Unsupported Device', 'This device does not support address verification');
      break;
    case 'invalid_phone':
      Alert.alert('Invalid Phone', 'Please use a valid phone number format');
      break;
    default:
      Alert.alert('Error', error.message || 'An unexpected error occurred');
  }
}
```

---

## Best Practices

### 1. Persist Verification State

Store the `location.id` and verification status locally to avoid re-prompting users:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function saveVerificationState(locationId: string, userId: string) {
  await AsyncStorage.setItem(`okhi_verified_${userId}`, JSON.stringify({
    locationId,
    verifiedAt: new Date().toISOString(),
  }));
}

async function isUserAlreadyVerified(userId: string): Promise<boolean> {
  const state = await AsyncStorage.getItem(`okhi_verified_${userId}`);
  return state !== null;
}
```

### 2. Use Test Phone Numbers Carefully

During development, OkHi sends real SMS messages. Always use phone numbers you control.

### 3. Call Logout on User Sign-Out

Always call `logout()` when your user signs out to stop signal collection:

```typescript
async function signOut() {
  await logout();  // Important: stops OkHi signal collection
  await clearUserSession();
  navigation.navigate('Login');
}
```

---

## Complete Integration Example

```typescript
// OkHiService.ts
import {
  login,
  logout,
  startAddressVerification,
  startPhysicalAddressVerification,
  startDigitalAndPhysicalAddressVerification,
  createAddress,
} from 'react-native-okhi';
import type { OkHiLogin, OkHiSuccessResponse, OkCollect } from 'react-native-okhi';

const OKHI_BRANCH_ID = 'your-branch-id';
const OKHI_CLIENT_KEY = 'your-client-key';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

class OkHiService {
  private initialized = false;

  async initialize(user: User): Promise<void> {
    if (this.initialized) return;

    const credentials: OkHiLogin = {
      auth: {
        branchId: OKHI_BRANCH_ID,
        clientKey: OKHI_CLIENT_KEY,
      },
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        appUserId: user.id,
      },
      appContext: {
        name: 'MyApp',
        version: '1.0.0',
        build: '1',
      },
    };

    await login(credentials);
    this.initialized = true;
  }

  async verifyAddress(options?: {
    type?: 'digital' | 'physical' | 'digitalAndPhysical';
    branding?: OkCollect;
  }): Promise<OkHiSuccessResponse> {
    const params = options?.branding ? { okcollect: options.branding } : undefined;

    switch (options?.type) {
      case 'physical':
        return startPhysicalAddressVerification(params);
      case 'digitalAndPhysical':
        return startDigitalAndPhysicalAddressVerification(params);
      default:
        return startAddressVerification(params);
    }
  }

  async collectAddress(branding?: OkCollect): Promise<OkHiSuccessResponse> {
    return createAddress(branding ? { okcollect: branding } : undefined);
  }

  async cleanup(): Promise<void> {
    await logout();
    this.initialized = false;
  }
}

export const okHiService = new OkHiService();
```

**Usage in a React component:**

```typescript
// AddressVerificationScreen.tsx
import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { okHiService } from './OkHiService';

export function AddressVerificationScreen({ user }) {
  const [verifying, setVerifying] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Initialize OkHi with user credentials
      await okHiService.initialize(user);

      // Start verification - library handles permissions internally
      const result = await okHiService.verifyAddress({
        type: 'digital',
        branding: {
          style: {
            color: '#1A73E8',
            name: 'MyApp',
            logo: 'https://example.com/logo.png',
          },
        },
      });

      setLocationId(result.location.id);
      Alert.alert('Success', `Address verified: ${result.location.formattedAddress}`);

      // Send to your backend
      await fetch('/api/save-address', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          locationId: result.location.id,
          address: result.location,
        }),
      });

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View>
      <Button
        title={verifying ? 'Verifying...' : 'Verify My Address'}
        onPress={handleVerify}
        disabled={verifying}
      />
      {locationId && <Text>Location ID: {locationId}</Text>}
    </View>
  );
}
```

---

## API Quick Reference

### Core Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `login(credentials)` | Initialize OkHi with user credentials | `Promise<string[] \| undefined>` |
| `logout()` | Stop signal collection and cleanup | `Promise<void>` |
| `startAddressVerification(params?)` | Start digital verification | `Promise<OkHiSuccessResponse>` |
| `startPhysicalAddressVerification(params?)` | Start physical verification | `Promise<OkHiSuccessResponse>` |
| `startDigitalAndPhysicalAddressVerification(params?)` | Start digital + physical verification | `Promise<OkHiSuccessResponse>` |
| `createAddress(params?)` | Create address without verification (AddressBook) | `Promise<OkHiSuccessResponse>` |

---

## Troubleshooting

### Common Issues

1. **"Play Services not available"**
   - Affects Android only; ensure device has Google Play Services installed

2. **Build errors on iOS**
   - Run `cd ios && pod install`
   - Ensure minimum iOS version is 12.0+

3. **Build errors on Android**
   - Verify Maven repository is added to settings.gradle
   - Ensure minSdk is 21+
   - Verify `foregroundServiceType="location"` is set on FOREGROUND_SERVICE permission

4. **Xcode 16.x build error: "no matching function for call to '__construct_at'"**
   - This is a C++ template compatibility issue with Xcode 16's libc++
   - Add the following to your `ios/Podfile` inside the `post_install` block:

   ```ruby
   post_install do |installer|
     # Fix: Force C++20 for all Pods (helps with Xcode 16/libc++ template issues)
     installer.pods_project.targets.each do |target|
       target.build_configurations.each do |config|
         config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
         config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
       end
     end
   end
   ```

   - Then run `cd ios && pod install && cd ..` to apply the changes
