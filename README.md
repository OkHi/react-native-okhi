# OkHi React Native

The official OkHi React Native library will enable you to start collecting and verifying your user's addresses.

# Prerequisites

## OkHi Client Key and Branch Id

First you need to obtain your OkHi client key and branch ID. You can get these by signing up [here](https://docs.google.com/forms/d/e/1FAIpQLSed2rhgKQ8iv-xiJrJnDqOTaPiP6c7oE7DzrhTPF_d3VTihDQ/viewform).
Use your sandbox keys while you test and develop, and your production mode keys before you publish your app.

## Android

### Change your minSdkVersion target

This library targets android devices >= SDK 23. Make sure you're targeting at-least the same by modifying your `android/build.gradle` file

```gradle
minSdkVersion = 23
```

### Add necessary permissions to your `AndroidManifest.xml`

```xml
<manifest ...>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    ...

    <application>
    ...
    </application>
​
</manifest>
```

If you're targeting Android versions > 8 and you're using the OkVerify library you need to make sure your users select on "Allow always" when granting permissions otherwise the verification process won't work.

## iOS

### Enable background mode in your application

OkHi obtains verification signals in the background, to enable this make sure to add "Location updates" and "Background fetch" to your Background Modes under Signing & Capabilities of your target.

![background modes](https://storage.googleapis.com/okhi-cdn/files/Screenshot%202021-11-02%20at%2008.01.13.png)

### Change your deployment target

All OkHi React Native libraries target ios devices >= 12. Make sure you're targeting at-least the same by modifying your both your Podfile and deployment target in xcode.

![deployemnttarget](https://storage.googleapis.com/okhi-cdn/files/Screenshot%202021-11-02%20at%2018.09.04.png)

Podile located under: `ios/Podfile`

```xml
platform :ios, '12.0'
```

### Add necessary permissions to your `Info.plist`

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>String that explains why you need when in use location permission</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>String that explains why you need always location permission</string>
```

## Installation

Run the bellow command in the root directory of your React Native project.

```yaml
yarn add react-native-okhi react-native-webview
```

Finally install all required pods by running the following command in the ios directory

```
cd ios/ && pod install && cd ../
```

# Usage

## Initialization

Add the following initialization code to your index.js file. Replace my_branch_id and my_client_key with the keys provided to you after sign up.

```javascript
import * as OkHi from 'react-native-okhi';

OkHi.initialize({
  credentials: {
    branchId: '<my_branch_id>',
    clientKey: '<my_client_key>',
  },
  context: {
    mode: 'sandbox',
  },
  notification: {
    title: 'Address verification in progress',
    text: 'Tap here to view your verification status.',
    channelId: 'okhi',
    channelName: 'OkHi Channel',
    channelDescription: 'OkHi verification alerts',
  },
})
  .then(() => console.log('init done'))
  .catch(console.log);
```

## Address Creation and Verification

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { OkHiLocationManager, canStartVerification } from 'react-native-okhi';

const App = () => {
  const [launch, setLaunch] = useState(false);

  useEffect(() => {
    canStartVerification({ requestServices: true }).then((result) => {
      setLaunch(result);
    }); // checks & requests for required services for verification to run
  });

  const user = {
    phone: '+254712345678', // required
    firstName: 'Julius',
    lastName: 'Kiano',
  };

  const handleOnSuccess = async (response) => {
    console.log(response.user); // user information
    console.log(response.location); // address information
    await response.startVerification();
  };

  const handleOnError = (error) => {
    console.log(error.code); // user information
    console.log(error.message); // address information
    setLaunch(false);
  };

  if (launch) {
    return (
      <View style={{ flex: 1 }}>
        <OkHiLocationManager
          user={user}
          launch={launch}
          onSuccess={handleOnSuccess}
          onCloseRequest={() => setLaunch(false)} // called when user taps on the top right close button
          onError={handleOnError}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Loading..</Text>
    </View>
  );
};

export default App;
```

# Documentation

- [Guide](https://docs.okhi.co/v/v5.1-beta/okhi-on-your-react-native-app)
- [Best practices](https://docs.google.com/document/d/1kxolQJ4n6tEgReuqVLYpDVMW--xvqv5UQ7AdvrN0Uw0/edit)
