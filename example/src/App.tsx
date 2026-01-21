import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  multiply,
  login,
  startDigitalVerification,
} from 'react-native-okhi';

const result = multiply(3, 7);

const handleLogin = async () => {
  const results = await login({
    auth: {
      branchId: 'B0lKOrJaUN',
      clientKey: '73957af9-faef-4c9f-ad27-e0abe969f76a',
      env: 'sandbox',
    },
    user: {
      phone: '+254700110590',
      firstName: 'Julius',
      lastName: 'Kiano',
      email: 'kiano@okhi.co',
      appUserId: 'abcd1234',
    },
  });
  console.log('Login results:', results);
};

const handleDigitalVerification = async () => {
  // Using defaults - no params needed
  const result = await startDigitalVerification();
  if (result) {
    console.log('Verification success:', result);
  }
};

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDigitalVerification}
      >
        <Text style={styles.buttonText}>Digital Verification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
