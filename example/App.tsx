// Drop-in replacement: create a cross-platform "Input" wrapper and use it
// Paste this into your file (or split into Input.tsx + styles) and replace <TextInput /> with <Input />

import React, { useEffect, useRef, useState, forwardRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  TextInputProps,
} from 'react-native';
import * as OkHi from 'react-native-okhi';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export function genAppUserId(): string {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * ✅ Consistent Input wrapper (Android + iOS)
 * - Normalizes height/padding/lineHeight
 * - Centers text vertically on Android
 * - Removes Android underline
 * - Applies consistent background + border styles
 */
type InputProps = TextInputProps & {
  containerStyle?: any;
};

const Input = forwardRef<TextInput, InputProps>(
  ({ style, containerStyle, ...props }, ref) => {
    return (
      <View style={[styles.inputContainer, containerStyle]}>
        <TextInput
          ref={ref}
          {...props}
          style={[styles.input, style]}
          underlineColorAndroid="transparent"
          placeholderTextColor={props.placeholderTextColor ?? '#9E9E9E'}
        />
      </View>
    );
  },
);
Input.displayName = 'Input';

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
        if (data) Clipboard.setString(data);
      },
    });
  };

  const handleLogin = async () => {
    if (!user.email || !user.firstName || !user.lastName || !user.phone) return;

    const result = await OkHi.login({
      auth: {
        branchId: '',
        clientKey: '',
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
      data = result.reduce((acc, value) => acc + ',' + value, '');
    }

    showMessage({
      title: 'Login success',
      message: data ? 'IDs copied to Clipboard!' : '🥳',
      data,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#EEEEEE',
        paddingTop: Platform.OS === 'ios' ? 45 : 0,
      }}
    >
      <ScrollView style={{ flex: 1, backgroundColor: '#EEEEEE' }}>
        <View style={{ flex: 1, paddingHorizontal: 15, paddingTop: 15 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#424242', marginBottom: 5 }}>email</Text>
            <Input
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              placeholder="kiano@okhi.co"
              value={user.email}
              onChangeText={email => setUser(prev => ({ ...prev, email }))}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#424242', marginBottom: 5 }}>phone</Text>
            <Input
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
              autoCorrect={false}
              placeholder="+254..."
              value={user.phone}
              onChangeText={phone => setUser(prev => ({ ...prev, phone }))}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#424242', marginBottom: 5 }}>
              first name
            </Text>
            <Input
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="name-given"
              autoCorrect={false}
              placeholder="John"
              value={user.firstName}
              onChangeText={firstName =>
                setUser(prev => ({ ...prev, firstName }))
              }
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#424242', marginBottom: 5 }}>last name</Text>
            <Input
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="family-name"
              autoCorrect={false}
              placeholder="Doe"
              value={user.lastName}
              onChangeText={lastName =>
                setUser(prev => ({ ...prev, lastName }))
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
                showMessage({
                  title: 'Success',
                  message: `started verification for ${result.location.id}`,
                  data: result.location.id ?? 'location id not available',
                });
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Button
              title="Physical Verification"
              onPress={async () => {
                const result = await OkHi.startPhysicalAddressVerification();
                showMessage({
                  title: 'Success',
                  message: `started verification for ${result.location.id}`,
                  data: result.location.id ?? 'location id not available',
                });
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Button
              title="Digital + Physical Verification"
              onPress={async () => {
                const result =
                  await OkHi.startDigitalAndPhysicalAddressVerification();
                showMessage({
                  title: 'Success',
                  message: `started verification for ${result.location.id}`,
                  data: result.location.id ?? 'location id not available',
                });
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Button
              title="Create an address"
              onPress={async () => {
                const result = await OkHi.createAddress();
                locationIdRef.current = result.location.id;
                showMessage({
                  title: 'Success',
                  message: `started verification for ${result.location.id}`,
                  data: result.location.id ?? 'location id not available',
                });
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Button
              title="Verify saved address"
              onPress={async () => {
                if (locationIdRef.current) {
                  const result = await OkHi.startAddressVerification({
                    okcollect: { locationId: locationIdRef.current },
                  });
                  showMessage({
                    title: 'Success',
                    message: `started verification for ${result.location.id}`,
                    data: result.location.id ?? 'location id not available',
                  });
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // wrapper is optional but helps ensure consistent clipping / radius
  inputContainer: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    // ✅ makes iOS/Android match closely
    height: 44,
    paddingHorizontal: 10,
    fontSize: 16,
    lineHeight: 20,

    // Android: ensure text is vertically centered
    ...(Platform.OS === 'android'
      ? { paddingVertical: 8, textAlignVertical: 'center' as const }
      : { paddingVertical: 12 }),
  },
});

export default App;
