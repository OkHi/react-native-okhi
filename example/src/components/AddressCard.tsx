import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Linking,
  Share,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import type { OkHiLocation } from 'react-native-okhi';

export type VerificationType = 'digital' | 'physical' | 'both' | 'address';

export interface StoredAddress {
  location: OkHiLocation;
  verificationType: VerificationType;
  timestamp: number;
}

interface AddressCardProps {
  address: StoredAddress;
  index: number;
}

const VERIFICATION_LABELS: Record<VerificationType, { label: string; color: string; bg: string }> = {
  digital: { label: 'Digital', color: '#1565C0', bg: '#E3F2FD' },
  physical: { label: 'Physical', color: '#2E7D32', bg: '#E8F5E9' },
  both: { label: 'Digital + Physical', color: '#7B1FA2', bg: '#F3E5F5' },
  address: { label: 'Address Only', color: '#757575', bg: '#F5F5F5' },
};

export function AddressCard({ address, index }: AddressCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePress = () => {
    if (address.location.url) {
      Linking.openURL(address.location.url);
    }
  };

  const handleShare = async () => {
    if (!address.location.url) {
      Alert.alert('Unable to Share', 'This address does not have a shareable link.');
      return;
    }

    try {
      await Share.share({
        message: address.location.url,
        url: address.location.url,
      });
    } catch (error) {
      // Fallback to clipboard
      Clipboard.setString(address.location.url);
      Alert.alert('Copied!', 'Address link copied to clipboard.');
    }
  };

  const handleDownloadCertificate = () => {
    // Feature coming soon - currently disabled
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const { location, verificationType } = address;
  const verificationConfig = VERIFICATION_LABELS[verificationType];

  const displayTitle = location.displayTitle || location.title || location.propertyName || 'Unnamed Location';
  const displaySubtitle = location.subtitle || location.formattedAddress || location.streetName || '';

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!address.location.url}
      >
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: verificationConfig.bg }]}>
            <Text style={[styles.badgeText, { color: verificationConfig.color }]}>
              {verificationConfig.label}
            </Text>
          </View>
          {address.location.url && (
            <View style={styles.linkIndicator}>
              <Text style={styles.linkIcon}>↗</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
            {displaySubtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {displaySubtitle}
              </Text>
            ) : null}
            {location.city || location.country ? (
              <Text style={styles.location} numberOfLines={1}>
                {[location.city, location.country].filter(Boolean).join(', ')}
              </Text>
            ) : null}
          </View>
        </View>

        {location.plusCode && (
          <View style={styles.plusCodeSection}>
            <View style={styles.plusCodeContainer}>
              <Text style={styles.plusCodeLabel}>Plus Code</Text>
              <Text style={styles.plusCode}>{location.plusCode}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            activeOpacity={0.7}
            disabled={!address.location.url}
          >
            <Text style={styles.shareButtonIcon}>↗</Text>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.certificateButton, styles.disabledButton]}
            onPress={handleDownloadCertificate}
            activeOpacity={1}
            disabled={true}
          >
            <Text style={styles.certificateButtonIcon}>📄</Text>
            <Text style={styles.certificateButtonText}>Certificate</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  linkIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: 14,
    color: '#005D67',
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  plusCodeSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  plusCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusCodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plusCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#005D67',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  shareButton: {
    backgroundColor: '#005D67',
  },
  shareButtonIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  certificateButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  certificateButtonIcon: {
    fontSize: 14,
  },
  certificateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
