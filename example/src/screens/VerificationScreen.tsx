import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as OkHi from 'react-native-okhi';
import { Card } from '../components/Card';
import { ResultModal } from '../components/ResultModal';
import { OkHiUser } from 'react-native-okhi';

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
    branchId: 'B0lKOrJaUN',
    clientKey: '73957af9-faef-4c9f-ad27-e0abe969f76a',
  },
  dev: {
    branchId: 'OGUXBJeocZ',
    clientKey: 'd76eb1f5-12a2-47a7-a6b6-2de88a5bc739',
  },
};

export function VerificationScreen({ navigation }: any) {
  const [loading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [resultTitle, setResultTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [environment, setEnvironment] = useState('');
  const locationIdRef = useRef<string | null>(null);

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
  }, []);

  const handleVerification = async (
    type: 'digital' | 'physical' | 'both' | 'address' | 'saved',
    title: string
  ) => {
    try {
      let result;

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
          locationIdRef.current = result.location.id || null;
          break;
        case 'saved':
          if (locationIdRef.current) {
            result = await OkHi.startDigitalAddressVerification({
              locationId: locationIdRef.current,
            });
          } else {
            result = {
              error: 'No saved location ID. Please create an address first.',
            };
          }
          break;
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={() => navigation.navigate('Helpers')}
          style={styles.helpersButton}
        >
          <Text style={styles.helpersButtonText}>Helpers →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {userName && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>User:</Text>
              <Text style={styles.userInfoValue}>{userName}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{userEmail}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Environment:</Text>
              <Text style={[styles.userInfoValue, styles.environmentBadge]}>
                {environment.toUpperCase()}
              </Text>
            </View>
          </View>
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
        </View>
      </ScrollView>

      <ResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        title={resultTitle}
        data={verificationResult}
        locationId={verificationResult?.location?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  spacer: {
    width: 1,
  },
  helpersButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  helpersButtonText: {
    fontSize: 16,
    color: '#005D67',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 12,
  },
  userInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    width: 100,
  },
  userInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  environmentBadge: {
    color: '#005D67',
    fontWeight: '700',
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
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
