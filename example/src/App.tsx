import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  multiply,
  login,
  startDigitalVerification,
  startPhysicalVerification,
  startDigitalAndPhysicalVerification,
  createAddress,
} from 'react-native-okhi';

const result = multiply(3, 7);

const handleLogin = async () => {
  const results = await login({
    auth: {
      branchId: '',
      clientKey: '',
      env: 'prod',
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
  try {
    const result = await startDigitalVerification();
    console.log('Digital Verification success:', result);
  } catch (error) {
    console.log('Digital Verification error:', error);
  }
};

const handlePhysicalVerification = async () => {
  try {
    const result = await startPhysicalVerification();
    console.log('Physical Verification success:', result);
  } catch (error) {
    console.log('Physical Verification error:', error);
  }
};

const handleDigitalAndPhysicalVerification = async () => {
  try {
    const result = await startDigitalAndPhysicalVerification();
    console.log('Digital & Physical Verification success:', result);
  } catch (error) {
    console.log('Digital & Physical Verification error:', error);
  }
};

const handleCreateAddress = async () => {
  try {
    const result = await createAddress();
    console.log('Create Address success:', result);
  } catch (error) {
    console.log('Create Address error:', error);
  }
};

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <TouchableOpacity
        style={styles.button}
        onPress={handlePhysicalVerification}
      >
        <Text style={styles.buttonText}>Physical Verification</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDigitalAndPhysicalVerification}
      >
        <Text style={styles.buttonText}>Digital & Physical</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCreateAddress}>
        <Text style={styles.buttonText}>Create Address</Text>
      </TouchableOpacity>
    </ScrollView>
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
