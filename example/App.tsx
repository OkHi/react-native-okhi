import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import * as OkHi from 'react-native-okhi';

function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Button
        title="login"
        onPress={async () => {
          const result = await OkHi.login({
            auth: {
              branchId: 'B0lKOrJaUN',
              clientKey: '73957af9-faef-4c9f-ad27-e0abe969f76a',
            },
            user: {
              firstName: 'Julius',
              lastName: 'Kiano',
              email: 'kiano@okhi.co',
              appUserId: 'xyz',
              phone: '+254700110590',
            },
          });
          console.log(result);
        }}
      />
      <Button
        title="login"
        onPress={async () => {
          try {
            const result = await OkHi.createAddress();
            console.log(result);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: 'green',
  },
});

export default App;
