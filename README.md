<h1 align="left">react-native-okhi</h1>

<p align="left">
  <strong>Address verification for emerging markets</strong>
  <br />
  Collect, verify, and manage user addresses with ease
</p>

<p align="left">
  <a href="https://www.npmjs.com/package/react-native-okhi">
    <img src="https://img.shields.io/npm/v/react-native-okhi.svg?style=flat-square&color=00B46E" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/react-native-okhi">
    <img src="https://img.shields.io/npm/dm/react-native-okhi.svg?style=flat-square&color=00B46E" alt="npm downloads" />
  </a>
  <a href="https://github.com/OkHi/react-native-okhi/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/react-native-okhi.svg?style=flat-square&color=00B46E" alt="license" />
  </a>
  <img src="https://img.shields.io/badge/platforms-android%20|%20ios-lightgrey.svg?style=flat-square" alt="platforms" />
  <img src="https://img.shields.io/badge/React%20Native-0.70+-blue.svg?style=flat-square" alt="react native version" />
</p>

<p align="left">
  <a href="https://github.com/OkHi/react-native-okhi/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/OkHi/react-native-okhi/ci.yml?branch=master&style=flat-square&label=build" alt="build status" />
  </a>
  <a href="https://github.com/OkHi/react-native-okhi">
    <img src="https://img.shields.io/badge/TypeScript-supported-blue.svg?style=flat-square" alt="typescript" />
  </a>
</p>

---

## Overview

The React Native OkHi SDK enables address verification for users in emerging markets where traditional addressing systems are unreliable. With just a few lines of code, you can:

- **Collect addresses** with an intuitive, map-based UI
- **Verify addresses** using digital signals, physical site visits, or both
- **Customize branding** to match your app's look and feel

## Installation

```bash
npm install react-native-okhi react-native-nitro-modules
# or
yarn add react-native-okhi react-native-nitro-modules
```

For iOS, install CocoaPods dependencies:

```bash
cd ios && pod install
```

## Quick Start

```typescript
import { login, startAddressVerification } from 'react-native-okhi';

// 1. Initialize after user authentication
await login({
  auth: {
    branchId: 'your-branch-id',
    clientKey: 'your-client-key',
  },
  user: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+254712345678',
    email: 'john@example.com',
    appUserId: 'user-123',
  },
});

// 2. Start address verification
const result = await startAddressVerification();

// 3. Store the location ID on your server
console.log('Location ID:', result.location.id);
```

## Verification Types

| Type | Function | Description |
|------|----------|-------------|
| **Digital** | `startAddressVerification()` | Collects location signals from device |
| **Physical** | `startPhysicalAddressVerification()` | Triggers physical site visits |
| **Digital + Physical** | `startDigitalAndPhysicalAddressVerification()` | Combines both methods |
| **Address Book** | `createAddress()` | Stores address without verification |

## Requirements

| Platform | Minimum Version |
|----------|-----------------|
| React Native | 0.70+ |
| Android | SDK 21 (Android 5.0) |
| iOS | 12.0+ |
| Node | 18.0+ |

## Documentation

For complete setup instructions including native configuration:

- **[Full Integration Guide](./AGENTS.md)** - Comprehensive setup for Android & iOS
- **[OkHi Documentation](https://docs.okhi.com)** - Official API docs and guides

## API Reference

### Core Functions

```typescript
// Authentication
login(credentials: OkHiLogin): Promise<string[] | undefined>
logout(): Promise<void>

// Verification
startAddressVerification(params?): Promise<OkHiSuccessResponse>
startPhysicalAddressVerification(params?): Promise<OkHiSuccessResponse>
startDigitalAndPhysicalAddressVerification(params?): Promise<OkHiSuccessResponse>
createAddress(params?): Promise<OkHiSuccessResponse>
```

### Response Type

```typescript
interface OkHiSuccessResponse {
  user: OkHiUser;
  location: OkHiLocation;  // Contains location.id for tracking
}
```

## UI Customization

```typescript
await startAddressVerification({
  okcollect: {
    style: {
      color: '#1A73E8',      // Your brand color
      name: 'Your App',      // Display name
      logo: 'https://...',   // Logo URL
    },
  },
});
```

## Support

- **Issues**: [GitHub Issues](https://github.com/OkHi/react-native-okhi/issues)
- **Documentation**: [docs.okhi.com](https://docs.okhi.com)
- **Email**: [team@okhi.com](mailto:support@okhi.com)

## License

MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  <sub>Built with love by <a href="https://okhi.com">OkHi</a> - AI-powered address verification for business</sub>
</p>
