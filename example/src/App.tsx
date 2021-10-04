import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { isLocationPermissionGranted } from 'react-native-okhi';

export default function App() {
  React.useEffect(() => {
    isLocationPermissionGranted().then(console.log);
  }, []);
  return (
    <View style={styles.container}>
      <Text>Result: Hiiiiii</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
