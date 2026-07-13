import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddressCard, StoredAddress } from '../components/AddressCard';

const ADDRESSES_STORAGE_KEY = 'okhi_verified_addresses';

export function AddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadAddresses = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (stored) {
        const parsed: StoredAddress[] = JSON.parse(stored);
        // Sort by timestamp, newest first
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setAddresses(parsed);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [loadAddresses, headerAnim]);

  // Reload addresses when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAddresses();
    });
    return unsubscribe;
  }, [navigation, loadAddresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAddresses();
  }, [loadAddresses]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#005D67"
            colors={['#005D67']}
          />
        }
      >
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>My Addresses</Text>
          <Text style={styles.subtitle}>
            {addresses.length === 0
              ? 'No addresses yet. Start a verification to add one.'
              : `${addresses.length} address${addresses.length === 1 ? '' : 'es'} in verification`}
          </Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🏠</Text>
            </View>
            <Text style={styles.emptyTitle}>No Addresses Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete a verification to see your addresses here
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.startButtonText}>Start Verification</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address, index) => (
              <AddressCard
                key={address.location.id || index}
                address={address}
                index={index}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
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
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    lineHeight: 21,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#005D67',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  addressList: {
    marginTop: 8,
  },
});
