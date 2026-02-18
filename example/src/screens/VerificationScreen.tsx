import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as OkHi from 'react-native-okhi';
import { Card } from '../components/Card';
import { ResultModal } from '../components/ResultModal';
import { LogoutBottomSheet } from '../components/LogoutBottomSheet';
import { LogoutResultModal } from '../components/LogoutResultModal';
import { OkHiUser, OkHiSuccessResponse } from 'react-native-okhi';
import type {
  StoredAddress,
  VerificationType,
} from '../components/AddressCard';

const ADDRESSES_STORAGE_KEY = 'okhi_verified_addresses';

type Environment = 'prod' | 'sandbox' | 'dev';

const ENVIRONMENT_CREDENTIALS: Record<
  Environment,
  { branchId: string; clientKey: string }
> = {
  prod: {
    branchId: 'bWpVwm65jy',
    clientKey: '3db1617f-b25b-4a80-8165-8077b4d1ea44',
  },
  sandbox: {
    branchId: 'bWpVwm65jy',
    clientKey: '3db1617f-b25b-4a80-8165-8077b4d1ea44',
  },
  dev: {
    branchId: 'OGUXBJeocZ',
    clientKey: 'd76eb1f5-12a2-47a7-a6b6-2de88a5bc739',
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function VerificationScreen({ navigation }: any) {
  const [loading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [resultTitle, setResultTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [environment, setEnvironment] = useState('');
  const [addressCount, setAddressCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutResult, setLogoutResult] = useState<string[] | null>(null);
  const [showLogoutResult, setShowLogoutResult] = useState(false);
  const locationIdRef = useRef<string | null>(null);
  const addressCardAnim = useRef(new Animated.Value(0)).current;

  const loadAddressCount = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (stored) {
        const addresses: StoredAddress[] = JSON.parse(stored);
        setAddressCount(addresses.length);
        if (addresses.length > 0) {
          Animated.spring(addressCardAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      }
    } catch (error) {
      console.error('Failed to load address count:', error);
    }
  }, [addressCardAnim]);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        const firstName = await AsyncStorage.getItem('firstName');
        const lastName = await AsyncStorage.getItem('lastName');
        const phone = await AsyncStorage.getItem('phone');
        const appUserId = await AsyncStorage.getItem('appUserId');
        const env = await AsyncStorage.getItem('environment');

        if (name) setUserName(name);
        if (email) setUserEmail(email);
        if (env) setEnvironment(env);

        const user: OkHiUser = {
          email: email || '',
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          appUserId: appUserId || '',
        };

        const envKey: Environment = (
          env === 'prod' || env === 'sandbox' || env === 'dev' ? env : 'prod'
        ) as Environment;

        await OkHi.login({
          auth: {
            branchId: ENVIRONMENT_CREDENTIALS[envKey].branchId,
            clientKey: ENVIRONMENT_CREDENTIALS[envKey].clientKey,
            env: envKey,
          },
          user,
          appContext: {
            name: 'OkHi App',
            build: '1.0.0',
            version: '1',
          },
          configuration: {
            withPermissionsRequest: false,
          },
        });
      } catch (error) {
        console.error('Failed to load user info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
    loadAddressCount();
  }, [loadAddressCount]);

  // Reload address count when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAddressCount();
    });
    return unsubscribe;
  }, [navigation, loadAddressCount]);

  const saveAddress = async (
    result: OkHiSuccessResponse,
    verificationType: VerificationType
  ) => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      const addresses: StoredAddress[] = stored ? JSON.parse(stored) : [];

      // Check if address with same ID already exists
      const existingIndex = addresses.findIndex(
        (addr) => addr.location.id === result.location.id
      );

      const newAddress: StoredAddress = {
        location: result.location,
        verificationType,
        timestamp: Date.now(),
      };

      if (existingIndex >= 0) {
        // Update existing address
        addresses[existingIndex] = newAddress;
      } else {
        // Add new address
        addresses.push(newAddress);
      }

      await AsyncStorage.setItem(
        ADDRESSES_STORAGE_KEY,
        JSON.stringify(addresses)
      );
      setAddressCount(addresses.length);

      // Animate the address card if this is the first address
      if (addresses.length === 1) {
        Animated.spring(addressCardAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handleVerification = async (
    type: 'digital' | 'physical' | 'both' | 'address' | 'saved',
    title: string
  ) => {
    try {
      let result: OkHiSuccessResponse | undefined;

      switch (type) {
        case 'digital':
          result = await OkHi.startDigitalAddressVerification();
          break;
        case 'physical':
          result = await OkHi.startPhysicalAddressVerification();
          break;
        case 'both':
          result = await OkHi.startDigitalAndPhysicalAddressVerification();
          break;
        case 'address':
          result = await OkHi.createAddress();
          if (result?.location?.id) {
            locationIdRef.current = result.location.id;
          }
          break;
        case 'saved':
          if (locationIdRef.current) {
            result = await OkHi.startDigitalAddressVerification({
              locationId: locationIdRef.current,
            });
          } else {
            setVerificationResult({
              error: 'No saved location ID. Please create an address first.',
            });
            setResultTitle(`${title} - Error`);
            setShowResult(true);
            return;
          }
          break;
      }

      if (result?.location) {
        // Map the type to VerificationType
        const verificationType: VerificationType =
          type === 'saved' ? 'digital' : type;
        await saveAddress(result, verificationType);
      }

      setVerificationResult(result);
      setResultTitle(title);
      setShowResult(true);
    } catch (error) {
      setVerificationResult({ error });
      setResultTitle(`${title} - Error`);
      setShowResult(true);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await OkHi.logout();
      setLogoutResult(result);
    } catch {
      setLogoutResult(null);
    } finally {
      setIsLoggingOut(false);
      setShowSettings(false);
      setShowLogoutResult(true);
    }
  };

  const handleLogoutDone = () => {
    setShowLogoutResult(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          {userName ? (
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting} numberOfLines={2}>
                {getGreeting()}, {userName.split(' ')[0]}
              </Text>
              <View style={styles.userMetaContainer}>
                <Text style={styles.userMeta}>{userEmail}</Text>
                <View style={styles.envDot} />
                <Text style={styles.envText}>{environment.toUpperCase()}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.greetingPlaceholder} />
          )}
          <TouchableOpacity
            style={styles.cogButton}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.cogIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {addressCount > 0 && (
          <Animated.View
            style={[
              styles.addressesCardWrapper,
              {
                opacity: addressCardAnim,
                transform: [
                  {
                    scale: addressCardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.addressesCard}
              onPress={() => navigation.navigate('Addresses')}
              activeOpacity={0.8}
            >
              <View style={styles.addressesCardContent}>
                <View style={styles.addressesIconContainer}>
                  <Text style={styles.addressesIcon}>📍</Text>
                </View>
                <View style={styles.addressesTextContainer}>
                  <Text style={styles.addressesCardTitle}>My Addresses</Text>
                  <Text style={styles.addressesCardSubtitle}>
                    {addressCount} address{addressCount === 1 ? '' : 'es'} in
                    verification
                  </Text>
                </View>
              </View>
              <View style={styles.addressesArrow}>
                <Text style={styles.addressesArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Address Verification</Text>
          <Text style={styles.subtitle}>
            Choose a verification type to test
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <Card
            title="Digital Verification"
            description="Verify address with digital verification only"
            icon="📱"
            onPress={() =>
              handleVerification('digital', 'Digital Verification')
            }
            disabled={loading}
          />

          <Card
            title="Physical Verification"
            description="Verify address with physical verification only"
            icon="🏠"
            onPress={() =>
              handleVerification('physical', 'Physical Verification')
            }
            disabled={loading}
          />

          <Card
            title="Digital + Physical"
            description="Verify address with both digital and physical verification"
            icon="🔄"
            onPress={() =>
              handleVerification('both', 'Digital + Physical Verification')
            }
            disabled={loading}
          />

          <Card
            title="Create Address"
            description="Create an address without verification (saves to addressbook)"
            icon="📍"
            onPress={() => handleVerification('address', 'Create Address')}
            disabled={loading}
          />

          <Card
            title="Verify Saved Address"
            description="Verify a previously saved address (must create address first)"
            icon="💾"
            onPress={() => handleVerification('saved', 'Verify Saved Address')}
            disabled={!locationIdRef.current || loading}
          />

          <Card
            title="Helpers"
            description="Test helper methods for permissions and location services"
            icon="🛠️"
            onPress={() => navigation.navigate('Helpers')}
            disabled={loading}
          />
        </View>
      </ScrollView>

      <ResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        title={resultTitle}
        data={verificationResult}
        locationId={verificationResult?.location?.id}
      />

      <LogoutBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <LogoutResultModal
        visible={showLogoutResult}
        locationIds={logoutResult}
        onDone={handleLogoutDone}
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
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greetingContainer: {
    flex: 1,
    marginRight: 12,
  },
  greetingPlaceholder: {
    flex: 1,
  },
  cogButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  cogIcon: {
    fontSize: 20,
    color: '#424242',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  userMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMeta: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  envDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 8,
  },
  envText: {
    fontSize: 12,
    color: '#005D67',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addressesCardWrapper: {
    marginBottom: 28,
  },
  addressesCard: {
    backgroundColor: '#005D67',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#005D67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addressesCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressesIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addressesIcon: {
    fontSize: 22,
  },
  addressesTextContainer: {
    flex: 1,
  },
  addressesCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  addressesCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  addressesArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addressesArrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    lineHeight: 21,
  },
  cardContainer: {
    marginTop: 8,
  },
});
