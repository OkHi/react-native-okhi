import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as OkHi from 'react-native-okhi';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ResultModal } from '../components/ResultModal';

type Environment = 'prod' | 'sandbox' | 'dev';

const ENVIRONMENT_CREDENTIALS = {
  prod: {
    branchId: 'bWpVwm65jy',
    clientKey: '3db1617f-b25b-4a80-8165-8077b4d1ea44',
  },
  sandbox: {
    branchId: 'B0lKOrJaUN',
    clientKey: '73957af9-faef-4c9f-ad27-e0abe969f76a',
  },
  dev: {
    branchId: 'OGUXBJeocZ',
    clientKey: 'd76eb1f5-12a2-47a7-a6b6-2de88a5bc739',
  },
};

function genAppUserId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function LoginScreen({ navigation }: any) {
  const appUserIdRef = useRef<string>('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<Environment>('prod');

  const [user, setUser] = useState({
    email: __DEV__ ? 'kiano@okhi.co' : '',
    firstName: __DEV__ ? 'Julius' : '',
    lastName: __DEV__ ? 'Kiano' : '',
    phone: __DEV__ ? '+254700110590' : '',
  });

  useEffect(() => {
    const initializeApp = async () => {
      // Check if user is already logged in
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        navigation.replace('Verification');
        return;
      }

      // Initialize or retrieve app user ID
      const appUserId = await AsyncStorage.getItem('appUserId');
      if (appUserId) {
        appUserIdRef.current = appUserId;
      } else {
        appUserIdRef.current = genAppUserId();
        await AsyncStorage.setItem('appUserId', appUserIdRef.current);
      }
    };

    initializeApp();
  }, [navigation]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!user.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!user.phone.trim()) {
      errors.push('Phone number is required');
    } else if (user.phone.length < 10) {
      errors.push('Please enter a valid phone number');
    }

    if (!user.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!user.lastName.trim()) {
      errors.push('Last name is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const credentials = ENVIRONMENT_CREDENTIALS[environment];

      const result = await OkHi.login({
        auth: {
          branchId: credentials.branchId,
          clientKey: credentials.clientKey,
        },
        user: {
          email: user.email.trim(),
          firstName: user.firstName.trim(),
          lastName: user.lastName.trim(),
          phone: user.phone.trim(),
          appUserId: appUserIdRef.current,
        },
      });

      // Save login state and user info
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userEmail', user.email.trim());
      await AsyncStorage.setItem(
        'userName',
        `${user.firstName.trim()} ${user.lastName.trim()}`
      );
      await AsyncStorage.setItem('environment', environment);

      setLoginResult(result);
      setShowResult(true);

      // Navigate to verification screen after showing result
      setTimeout(() => {
        setShowResult(false);
        navigation.replace('Verification');
      }, 2000);
    } catch (error) {
      setLoginResult({ error: error });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    user.email && user.firstName && user.lastName && user.phone;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>OkHi</Text>
            <Text style={styles.subtitle}>
              Login to test address verification
            </Text>
          </View>

          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              {validationErrors.map((error, index) => (
                <View key={index} style={styles.errorRow}>
                  <Text style={styles.errorBullet}>•</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.environmentContainer}>
            <Text style={styles.environmentLabel}>Environment</Text>
            <View style={styles.environmentButtons}>
              {(['prod', 'sandbox', 'dev'] as Environment[]).map((env) => (
                <TouchableOpacity
                  key={env}
                  style={[
                    styles.environmentButton,
                    environment === env && styles.environmentButtonActive,
                  ]}
                  onPress={() => setEnvironment(env)}
                >
                  <Text
                    style={[
                      styles.environmentButtonText,
                      environment === env && styles.environmentButtonTextActive,
                    ]}
                  >
                    {env.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              placeholder="kiano@okhi.co"
              value={user.email}
              onChangeText={(email) => {
                setUser((prev) => ({ ...prev, email }));
                setValidationErrors([]);
              }}
            />

            <Input
              label="Phone"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
              autoCorrect={false}
              placeholder="+254..."
              value={user.phone}
              onChangeText={(phone) => {
                setUser((prev) => ({ ...prev, phone }));
                setValidationErrors([]);
              }}
            />

            <Input
              label="First Name"
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="name-given"
              autoCorrect={false}
              placeholder="John"
              value={user.firstName}
              onChangeText={(firstName) => {
                setUser((prev) => ({ ...prev, firstName }));
                setValidationErrors([]);
              }}
            />

            <Input
              label="Last Name"
              keyboardType="default"
              autoCapitalize="words"
              autoComplete="family-name"
              autoCorrect={false}
              placeholder="Doe"
              value={user.lastName}
              onChangeText={(lastName) => {
                setUser((prev) => ({ ...prev, lastName }));
                setValidationErrors([]);
              }}
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid || loading}
              style={styles.loginButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        title="Login Response"
        data={loginResult}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  errorBullet: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  environmentContainer: {
    marginBottom: 24,
  },
  environmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  environmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  environmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  environmentButtonActive: {
    borderColor: '#005D67',
    backgroundColor: '#E0F2F1',
  },
  environmentButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#757575',
  },
  environmentButtonTextActive: {
    color: '#005D67',
  },
  form: {
    flex: 1,
  },
  loginButton: {
    marginBottom: 12,
  },
});
