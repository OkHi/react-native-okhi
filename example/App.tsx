import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import * as OkHi from 'react-native-okhi';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OkHiLocation } from '../src/types';

export function genAppUserId(): string {
  return Math.random().toString(36).substring(2, 8);
}

function App(): React.JSX.Element {
  const appUserIdRef = useRef<string>('');
  const locationIdRef = useRef<string | null | undefined>('');
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    AsyncStorage.getItem('appUserId').then(result => {
      if (result) {
        appUserIdRef.current = result;
      } else {
        appUserIdRef.current = genAppUserId();
        AsyncStorage.setItem('appUserId', appUserIdRef.current);
      }
    });
  }, []);

  const showMessage = ({
    title,
    message,
    data,
  }: {
    title: string;
    message: string;
    data?: string;
  }) => {
    Alert.alert(title, message, [], {
      cancelable: true,
      onDismiss: () => {
        if (data) {
          Clipboard.setString(data);
        }
      },
    });
  };

  const handleLogin = async () => {
    if (!user.email || !user.firstName || !user.lastName || !user.phone) return;
    const result = await OkHi.login({
      auth: {
        branchId: 'OGUXBJeocZ',
        clientKey: 'd76eb1f5-12a2-47a7-a6b6-2de88a5bc739',
        env: 'dev',
      },
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        appUserId: appUserIdRef.current,
      },
    });

    let data: string | undefined = undefined;

    if (result?.length) {
      data = result.reduce((acc, value) => {
        return acc + ',' + value;
      }, '');
    }
    showMessage({
      title: 'Login success',
      message: data ? 'IDs copied to Clipboard!' : '🥳',
      data,
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#EEEEEE' }}>
      <View style={{ flex: 1, paddingHorizontal: 15, paddingTop: 15 }}>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#424242', marginBottom: 5 }}>email</Text>
          <TextInput
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderColor: '#BDBDBD',
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            autoFocus
            placeholder="kiano@okhi.co"
            value={user.email}
            onChangeText={email =>
              setUser(prevUser => ({ ...prevUser, email }))
            }
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#424242', marginBottom: 5 }}>phone</Text>
          <TextInput
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderColor: '#BDBDBD',
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete="tel"
            autoCorrect={false}
            autoFocus
            placeholder="+254..."
            value={user.phone}
            onChangeText={phone =>
              setUser(prevUser => ({ ...prevUser, phone }))
            }
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#424242', marginBottom: 5 }}>first name</Text>
          <TextInput
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderColor: '#BDBDBD',
            }}
            keyboardType="default"
            autoCapitalize="words"
            autoComplete="name-given"
            autoCorrect={false}
            autoFocus
            placeholder="John"
            value={user.firstName}
            onChangeText={firstName =>
              setUser(prevUser => ({ ...prevUser, firstName }))
            }
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: '#424242', marginBottom: 5 }}>last name</Text>
          <TextInput
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderColor: '#BDBDBD',
            }}
            keyboardType="default"
            autoCapitalize="words"
            autoComplete="family-name"
            autoCorrect={false}
            autoFocus
            placeholder="Doe"
            value={user.lastName}
            onChangeText={lastName =>
              setUser(prevUser => ({ ...prevUser, lastName }))
            }
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Button title="Login" onPress={handleLogin} />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Button
            title="Digital Verification"
            onPress={async () => {
              const result = await OkHi.startAddressVerification();
              const location = JSON.parse(result.location) as OkHiLocation;
              showMessage({
                title: 'Success',
                message:
                  'Verification started successfully. ID copied to clipboard!',
                data: location.id ?? 'location id not available',
              });
            }}
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Button
            title="Physical Verification"
            onPress={async () => {
              await OkHi.startPhysicalAddressVerification();
              const result = await OkHi.startPhysicalAddressVerification();
              const location = JSON.parse(result.location) as OkHiLocation;
              showMessage({
                title: 'Success',
                message:
                  'Verification started successfully. ID copied to clipboard!',
                data: location.id ?? 'location id not available',
              });
            }}
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Button
            title="Create an address"
            onPress={async () => {
              const result = await OkHi.createAddress();
              const location = JSON.parse(result.location) as OkHiLocation;
              locationIdRef.current = location.id;
              showMessage({
                title: 'Address created',
                message: 'Address created successfully',
              });
            }}
          />
        </View>
        <View style={{ marginBottom: 15 }}>
          <Button title="Verify saved address" />
        </View>
      </View>
    </ScrollView>
  );
}

export default App;
