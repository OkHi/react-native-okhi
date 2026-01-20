import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  isLocationServicesEnabled,
  canOpenProtectedApps,
  getLocationAccuracyLevel,
  isBackgroundLocationPermissionGranted,
  isCoarseLocationPermissionGranted,
  isFineLocationPermissionGranted,
  isPlayServicesAvailable,
  isPostNotificationPermissionGranted,
  openProtectedApps,
  requestBackgroundLocationPermission,
  requestEnableLocationServices,
  requestLocationPermission,
  requestPostNotificationPermissions,
} from 'react-native-okhi';
import { Card } from '../components/Card';
import { ResultModal } from '../components/ResultModal';

interface HelperFunction {
  name: string;
  title: string;
  description: string;
  icon: string;
  isRequest?: boolean;
}

const checkHelpers: HelperFunction[] = [
  {
    name: 'isLocationServicesEnabled',
    title: 'Location Services Enabled',
    description: 'Check if location services are enabled',
    icon: '📍',
  },
  {
    name: 'canOpenProtectedApps',
    title: 'Can Open Protected Apps',
    description: 'Check if app can open protected apps settings',
    icon: '🛡️',
  },
  {
    name: 'getLocationAccuracyLevel',
    title: 'Location Accuracy Level',
    description: 'Get current location accuracy permission level',
    icon: '🎯',
  },
  {
    name: 'isBackgroundLocationPermissionGranted',
    title: 'Background Location Permission',
    description: 'Check if background location permission is granted',
    icon: '🔄',
  },
  {
    name: 'isCoarseLocationPermissionGranted',
    title: 'Coarse Location Permission',
    description: 'Check if coarse location permission is granted',
    icon: '📡',
  },
  {
    name: 'isFineLocationPermissionGranted',
    title: 'Fine Location Permission',
    description: 'Check if fine location permission is granted',
    icon: '🎯',
  },
  {
    name: 'isPlayServicesAvailable',
    title: 'Play Services Available',
    description: 'Check if Google Play Services is available (Android)',
    icon: '🤖',
  },
  {
    name: 'isPostNotificationPermissionGranted',
    title: 'Notification Permission',
    description: 'Check if post notification permission is granted',
    icon: '🔔',
  },
];

const actionHelpers: HelperFunction[] = [
  {
    name: 'openProtectedApps',
    title: 'Open Protected Apps',
    description: 'Open protected apps settings page',
    icon: '⚙️',
    isRequest: true,
  },
  {
    name: 'requestBackgroundLocationPermission',
    title: 'Request Background Location',
    description: 'Request background location permission',
    icon: '📍',
    isRequest: true,
  },
  {
    name: 'requestEnableLocationServices',
    title: 'Request Enable Location',
    description: 'Request to enable location services',
    icon: '🗺️',
    isRequest: true,
  },
  {
    name: 'requestLocationPermission',
    title: 'Request Location Permission',
    description: 'Request location permission',
    icon: '📌',
    isRequest: true,
  },
  {
    name: 'requestPostNotificationPermissions',
    title: 'Request Notification Permission',
    description: 'Request post notification permission',
    icon: '🔔',
    isRequest: true,
  },
];

export function HelpersScreen({ navigation }: any) {
  const [showResult, setShowResult] = useState(false);
  const [helperResult, setHelperResult] = useState<any>(null);
  const [resultTitle, setResultTitle] = useState('');

  const helperMap: Record<string, () => Promise<any>> = {
    isLocationServicesEnabled,
    canOpenProtectedApps,
    getLocationAccuracyLevel,
    isBackgroundLocationPermissionGranted,
    isCoarseLocationPermissionGranted,
    isFineLocationPermissionGranted,
    isPlayServicesAvailable,
    isPostNotificationPermissionGranted,
    openProtectedApps,
    requestBackgroundLocationPermission,
    requestEnableLocationServices,
    requestLocationPermission,
    requestPostNotificationPermissions,
  };

  const handleHelperCall = async (helperName: string, title: string) => {
    try {
      const helperFn = helperMap[helperName];

      if (typeof helperFn !== 'function') {
        throw new Error(`Helper function ${helperName} not found`);
      }

      const result = await helperFn();

      setHelperResult({ result });
      setResultTitle(title);
      setShowResult(true);
    } catch (error) {
      setHelperResult({ error: error instanceof Error ? error.message : String(error) });
      setResultTitle(`${title} - Error`);
      setShowResult(true);
    }
  };

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
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Helper Functions</Text>
          <Text style={styles.subtitle}>
            Test location and permission helpers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check Permissions & Status</Text>
          <View style={styles.cardContainer}>
            {checkHelpers.map(helper => (
              <Card
                key={helper.name}
                title={helper.title}
                description={helper.description}
                icon={helper.icon}
                onPress={() => handleHelperCall(helper.name, helper.title)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Permissions & Actions</Text>
          <View style={styles.cardContainer}>
            {actionHelpers.map(helper => (
              <Card
                key={helper.name}
                title={helper.title}
                description={helper.description}
                icon={helper.icon}
                onPress={() => handleHelperCall(helper.name, helper.title)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <ResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        title={resultTitle}
        data={helperResult}
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    lineHeight: 21,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 16,
  },
  cardContainer: {
    marginTop: 8,
  },
});
