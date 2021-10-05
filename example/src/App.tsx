/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
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
} from 'react-native-okhi';

const USER: OkHiUser = {
  phone: '+254700110590',
  firstName: 'Julius',
  lastName: 'Kiano',
};

const App = () => {
  const [launch, setLaunch] = useState(false);

  const handleOnSuccess = (response: OkCollectSuccessResponse) => {
    // perform any logic you'd wish with user and location objects
    console.log(response.user);
    console.log(response.location);
    setLaunch(false);
  };

  const handleOnError = () => {
    // console.log(error.code);
    // console.log(error.message);
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
        title="google play services request"
        onPress={() => {
          requestEnableGooglePlayServices()
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
      <Button title="Create Address" onPress={() => setLaunch(true)} />
      <OkHiLocationManager
        user={USER}
        launch={launch}
        onSuccess={handleOnSuccess}
        onCloseRequest={() => setLaunch(false)} // called when user taps on the top right close button
        onError={handleOnError}
      />
    </View>
  );
};

export default App;
