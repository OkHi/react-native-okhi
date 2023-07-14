import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import {
  isLocationServicesEnabled,
  isLocationPermissionGranted,
  isBackgroundLocationPermissionGranted,
  requestBackgroundLocationPermission,
  requestLocationPermission,
  requestEnableLocationServices,
  isGooglePlayServicesAvailable,
  requestEnableGooglePlayServices,
  getSystemVersion,
  OkCollectSuccessResponse,
  OkHiLocationManager,
  // OkHiException,
  OkHiUser,
  stopVerification,
  startForegroundService,
  stopForegroundService,
  canStartVerification,
  canStartAddressCreation,
  request,
  openAppSettings,
  retriveLocationPermissionStatus,
  requestTrackingAuthorization,
  initialize,
} from 'react-native-okhi';

const USER: OkHiUser = {
  phone: '+254700110590',
  firstName: 'Julius',
  lastName: 'Kiano',
};

const App = () => {
  const [launch, setLaunch] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize({
      credentials: {
        branchId: '',
        clientKey: '',
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
    }).then(() => setIsReady(true));
  }, []);
  const handleOnSuccess = (response: OkCollectSuccessResponse) => {
    console.log(response);
    response.startVerification().then(console.log).catch(console.error);
    if (response.location.id) {
      setLocationId(response.location.id);
    }
    setLaunch(false);
  };

  const handleOnError = (error: any) => {
    console.log(error);
    setLaunch(false); // Make sure to change the launch value onError
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="location services check"
        onPress={() => {
          isLocationServicesEnabled().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="request location services"
        onPress={() => {
          requestEnableLocationServices().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="location permission check"
        onPress={() => {
          isLocationPermissionGranted().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="background location permission check"
        onPress={() => {
          isBackgroundLocationPermissionGranted()
            .then(console.log)
            .catch(console.log);
        }}
      />
      <Button
        title="request location permission"
        onPress={() => {
          requestLocationPermission().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="request me"
        onPress={() => {
          request(
            'always',
            {
              title: 'Location Permission',
              text: 'Please grant',
              successButton: { label: 'Grant' },
              denyButton: { label: 'Deny' },
            },
            (status, error) => {
              console.log(status);
              console.log(error);
            }
          );
        }}
      />
      <Button
        title="request background location permission"
        onPress={() => {
          requestBackgroundLocationPermission()
            .then(console.log)
            .catch(console.log);
        }}
      />
      <Button
        title="google play services check"
        onPress={() => {
          isGooglePlayServicesAvailable().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="request status"
        onPress={() => {
          retriveLocationPermissionStatus()
            .then(console.log)
            .catch(console.log);
          // isGooglePlayServicesAvailable().then(console.log).catch(console.log);
        }}
      />
      <Button
        title="google play services request"
        onPress={() => {
          requestEnableGooglePlayServices()
            .then(console.log)
            .catch(console.log);
        }}
      />
      <Button
        title="Can start verification"
        onPress={() => {
          canStartVerification({ requestServices: true })
            .then(console.log)
            .catch(console.log);
        }}
      />
      <Button
        title="Can start address creation"
        onPress={() => {
          canStartAddressCreation({ requestServices: true })
            .then(console.log)
            .catch(console.log);
        }}
      />
      <Button
        title="system version"
        onPress={() => {
          getSystemVersion().then(console.log).catch(console.log);
        }}
      />
      <Button title="open app settings" onPress={openAppSettings} />
      <Button title="Create Address" onPress={() => setLaunch(true)} />
      <Button
        title="Stop Verification"
        onPress={() => {
          if (locationId) {
            stopVerification(USER.phone, locationId).then((result) =>
              console.log(`stopped verification for: ${result}`)
            );
          }
        }}
      />
      <Button
        title="Start Foreground Service"
        onPress={() =>
          startForegroundService()
            .then((result) =>
              console.log(`start foreground service: ${result}`)
            )
            .catch(console.log)
        }
      />
      <Button
        title="Stop Foreground Service"
        onPress={() =>
          stopForegroundService()
            .then((result) => console.log(`stop foreground service: ${result}`))
            .catch(console.log)
        }
      />
      <Button
        title="Request Tracking Auth"
        onPress={() =>
          requestTrackingAuthorization()
            .then((result) => console.log(`tracking auth: ${result}`))
            .catch(console.log)
        }
      />
      {isReady ? (
        <OkHiLocationManager
          user={USER}
          launch={launch}
          onSuccess={handleOnSuccess}
          onCloseRequest={() => setLaunch(false)} // called when user taps on the top right close button
          onError={handleOnError}
          config={{ addressTypes: { home: true, work: false } }}
        />
      ) : null}
    </View>
  );
};

export default App;
